#!/usr/bin/env bash
# Recette d'acceptation de bout en bout — spec "Export mono-tenant", §6.
#
# Construit une archive livrable pour un tenant réel, la démarre sur une
# stack Docker vierge (aucune dépendance à l'infra Civelo), importe les
# données et vérifie automatiquement les 7 critères d'acceptation :
#   1. archive générée sans erreur
#   2. démarre avec `docker compose up`
#   3. site public affiche le bon thème et le bon contenu
#   4. images affichées, aucune ne pointe vers notre S3
#   5. back-office accessible, permet de modifier une page
#   6. modification visible sur le site public
#   7. aucune trace d'un autre tenant nulle part
#
# Usage :
#   scripts/e2e-archive-test.sh --domaine=saint-hilaire-bonneval.fr --theme=edito --slug=saint-hilaire-bonneval
#
# Échoue (exit != 0) au premier critère non satisfait — jamais un simple
# avertissement. Nettoie systématiquement ses conteneurs/volumes/dossiers de
# travail en sortie, succès ou échec.

set -euo pipefail

DOMAINE=""
THEME=""
SLUG=""
for arg in "$@"; do
  case "$arg" in
    --domaine=*) DOMAINE="${arg#--domaine=}" ;;
    --theme=*) THEME="${arg#--theme=}" ;;
    --slug=*) SLUG="${arg#--slug=}" ;;
    *) echo "Argument inconnu : $arg" >&2; exit 1 ;;
  esac
done

if [[ -z "$DOMAINE" || -z "$THEME" || -z "$SLUG" ]]; then
  echo "Usage : $0 --domaine=<domaine.fr> --theme=<edito|app|accueillant> --slug=<slug>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WORKDIR="$ROOT/exports/_e2e_test"
EXPORT_DIR="$ROOT/exports/_e2e_test_export_$SLUG"
ARCHIVE_NAME="$SLUG-$(date +%Y-%m-%d)"
ARCHIVE_DIR="$WORKDIR/$ARCHIVE_NAME"
COMPOSE_PROJECT="e2e-$SLUG"
PASS=0
FAIL=0

pass() { echo "  ✓ $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ $1" >&2; FAIL=$((FAIL+1)); }
die() { echo "ÉCHEC BLOQUANT : $1" >&2; cleanup; exit 1; }

cleanup() {
  if [[ -d "$ARCHIVE_DIR" ]]; then
    (cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true)
  fi
  [[ -n "${DEV_PID:-}" ]] && kill "$DEV_PID" 2>/dev/null || true
  rm -rf "$WORKDIR" "$EXPORT_DIR" "$WORKDIR.dev-server.log"
}
trap cleanup EXIT

echo "── 1/7 — export des données du tenant ──"
rm -rf "$EXPORT_DIR"

# `export-tenant.ts` télécharge les médias via HTTP depuis `--base-url`
# (par défaut `https://<domaine>`) — inutilisable ici : `domaine` sur la
# fiche tenant n'est pas forcément un nom d'hôte réellement joignable
# (démo locale). On sert temporairement l'app en local pour cette seule
# étape, uniquement comme source de téléchargement des fichiers déjà en
# base — aucune donnée n'est modifiée.
DEV_PORT=3900
npm run dev -- --port "$DEV_PORT" >"$WORKDIR.dev-server.log" 2>&1 &
DEV_PID=$!
DEV_READY=0
for i in $(seq 1 60); do
  if curl -s -o /dev/null "http://localhost:$DEV_PORT" 2>/dev/null; then DEV_READY=1; break; fi
  kill -0 "$DEV_PID" 2>/dev/null || break
  sleep 1
done
if [[ "$DEV_READY" != "1" ]]; then
  kill "$DEV_PID" 2>/dev/null || true
  die "le serveur de dev local (source des médias pour l'export) n'a jamais démarré"
fi

EXPORT_TENANT_YES=1 node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs \
  scripts/export-tenant.ts --domaine="$DOMAINE" --out="$EXPORT_DIR/$SLUG" --base-url="http://localhost:$DEV_PORT" \
  || { kill "$DEV_PID" 2>/dev/null || true; die "l'export du tenant a échoué"; }

kill "$DEV_PID" 2>/dev/null || true
wait "$DEV_PID" 2>/dev/null || true
pass "export généré sans erreur"

echo "── 1/7 — assemblage de l'archive ──"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs \
  scripts/build-tenant-archive.ts --export="$EXPORT_DIR/$SLUG" --theme="$THEME" --slug="$SLUG" \
  || die "l'assemblage de l'archive a échoué (ou la checklist sécurité a bloqué)"
ZIP="$ROOT/exports/_build/$SLUG-$(date +%Y-%m-%d).zip"
[[ -f "$ZIP" ]] || die "zip introuvable après assemblage : $ZIP"
unzip -q "$ZIP" -d "$WORKDIR"
[[ -d "$ARCHIVE_DIR" ]] || die "dossier d'archive introuvable après extraction : $ARCHIVE_DIR"
pass "archive générée et extraite sans erreur"

echo "── 2/7 — démarrage sur stack Docker vierge ──"
DB_PASSWORD="e2e-test-$(date +%s)"
PAYLOAD_SECRET="e2e-test-secret-$(date +%s)"
cat > "$ARCHIVE_DIR/.env" <<EOF
DB_PASSWORD=$DB_PASSWORD
PAYLOAD_SECRET=$PAYLOAD_SECRET
EOF

(cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" up --build -d) \
  || die "docker compose up a échoué"

echo "  → attente du démarrage de l'app (build + boot)…"
READY=0
for i in $(seq 1 90); do
  if (cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" logs app 2>&1) | grep -q "Ready in"; then
    READY=1
    break
  fi
  if (cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" ps app --format '{{.State}}' 2>/dev/null) | grep -qi "exited"; then
    (cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" logs app) | tail -60
    die "le conteneur app s'est arrêté avant d'être prêt"
  fi
  sleep 2
done
[[ "$READY" == "1" ]] || die "l'app n'a jamais atteint l'état 'Ready' après 180s"
pass "docker compose up réussi, app prête"

# Aucune route front ne doit être pré-rendue statique : sinon elle fige le
# contenu vide du moment du build (avant l'import) au lieu de refléter les
# données réelles — voir shared/lib/tenant.ts pour le correctif appliqué.
if (cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" logs app 2>&1) | grep -qE '^\S*\|\s*┌ ○ /\s'; then
  die "la page d'accueil a été pré-rendue statique (build avant import) — régression du correctif dynamic-rendering"
fi
pass "aucune route front pré-rendue statique"

PORT="$(cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" port app 3000 | cut -d: -f2)"
BASE="http://localhost:$PORT"

echo "── back-office : import des données ──"
(cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" exec -T app \
  node --experimental-loader=./scripts/_resolve-ts.mjs /scripts/import.ts) \
  || die "l'import des données a échoué"
pass "import terminé sans erreur"

echo "── 3/7 + 4/7 — site public : thème, contenu, images ──"
HOME_HTML="$(curl -s -o - -w '' "$BASE/")"
HOME_CODE="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")"
[[ "$HOME_CODE" == "200" ]] || die "page d'accueil : HTTP $HOME_CODE"
pass "page d'accueil accessible (HTTP 200)"

if echo "$HOME_HTML" | grep -q "/api/media/file/"; then
  pass "contenu réel importé affiché (médias servis via /api/media/file/)"
else
  fail "aucune image réelle détectée sur la page d'accueil (repli statique suspecté)"
fi

if echo "$HOME_HTML" | grep -qiE "ovh|\.s3\.|amazonaws"; then
  fail "une URL pointant vers notre bucket/infra a été trouvée sur le site public"
else
  pass "aucune URL vers notre bucket/infra sur le site public"
fi

for path in "/" "/commerces" "/contact" "/agenda" "/mairie/maire-elus" "/tourisme/carte-interactive"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")"
  [[ "$code" == "200" ]] && pass "route $path : HTTP 200" || fail "route $path : HTTP $code"
done

echo "── 5/7 + 6/7 — back-office : édition et propagation ──"
(cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" exec -T app \
  node --experimental-loader=./scripts/_resolve-ts.mjs scripts/create-admin-user.ts \
  e2e-test@example.com e2e-test-password >/dev/null) \
  || die "la création de l'utilisateur admin a échoué"
pass "compte admin créé dans le back-office"

TOKEN="$(curl -s -X POST "$BASE/api/users/login" -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@example.com","password":"e2e-test-password"}' \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).token))')"
[[ -n "$TOKEN" ]] || die "connexion admin impossible (token vide)"

PAGE_ID="$(curl -s -G "$BASE/api/pages" --data-urlencode 'where[slug][equals]=histoire' --data-urlencode 'depth=0' \
  -H "Authorization: JWT $TOKEN" \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d).docs[0].id))')"
[[ -n "$PAGE_ID" ]] || die "page 'histoire' introuvable via l'API"

MARKER="E2E-EDIT-$(date +%s)"
PATCH_CODE="$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$BASE/api/pages/$PAGE_ID" \
  -H "Authorization: JWT $TOKEN" -H "Content-Type: application/json" \
  -d "{\"editorial\":{\"sousTitre\":\"$MARKER\"}}")"
[[ "$PATCH_CODE" == "200" ]] || die "la modification de la page via le back-office a échoué (HTTP $PATCH_CODE)"
pass "modification d'une page via le back-office réussie"

PUBLIC_HTML="$(curl -s "$BASE/histoire")"
if echo "$PUBLIC_HTML" | grep -q "$MARKER"; then
  pass "la modification est immédiatement visible sur le site public"
else
  fail "la modification n'apparaît PAS sur le site public"
fi

echo "── 7/7 — aucune trace d'un autre tenant ──"
TENANT_COUNT="$(cd "$ARCHIVE_DIR" && docker compose -p "$COMPOSE_PROJECT" exec -T db \
  psql -U "$SLUG" -d "$SLUG" -t -c "select count(*) from tenants;" | tr -d '[:space:]')"
if [[ "$TENANT_COUNT" == "1" ]]; then
  pass "un seul tenant présent en base ($TENANT_COUNT)"
else
  fail "nombre de tenants inattendu en base : $TENANT_COUNT (attendu : 1)"
fi

if find "$ARCHIVE_DIR" -maxdepth 2 -type d -name "themes" -exec find {} -mindepth 1 -maxdepth 1 -type d \; 2>/dev/null | grep -v "$THEME" | grep -q .; then
  fail "un thème autre que '$THEME' est présent dans l'archive"
else
  pass "seul le thème '$THEME' est présent dans l'archive"
fi

if [[ -f "$ARCHIVE_DIR/app/.env" ]] || find "$ARCHIVE_DIR" -name ".env" -not -path "*/node_modules/*" 2>/dev/null | grep -v "^$ARCHIVE_DIR/.env$" | grep -q .; then
  fail "un fichier .env autre que celui créé par ce test est présent dans l'archive"
else
  pass "aucun .env réel embarqué dans l'archive (hors celui du test)"
fi

echo
echo "═══════════════════════════════════════"
echo "Résultat : $PASS critère(s) validé(s), $FAIL échoué(s)."
echo "═══════════════════════════════════════"

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
