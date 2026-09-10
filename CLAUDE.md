# Civelo — point d'entrée de contexte

Ce fichier est court **volontairement** : il ne contient que ce qu'une session Claude Code doit avoir en tête *avant de toucher au repo*. Le détail vit dans `.claude/docs/`.

Versionné. À tenir à jour quand une règle non négociable ou un pointeur change.

---

## Ce qu'est Civelo (en une phrase)

Une seule application Next.js + Payload CMS, une seule base Postgres, qui sert jusqu'à ~250 sites de mairies françaises. Ajouter une commune = une ligne en base + un DNS, **jamais** un nouveau déploiement.

- Repo GitHub : `github.com/charles4nier/civelo` (remote `origin`)
- App Scalingo : `civelo` / région `osc-fr1` (remote `scalingo`)
- Client de référence en ligne : Saint-Hilaire-Bonneval → `edito.civelo.fr`

---

## Les 6 règles non négociables

1. **Répondre exclusivement en français.**
2. **Jamais « SaaS », « multi-tenant », « plateforme mutualisée » face à un client final.** De son point de vue il a *son* site. (Voir `.claude/docs/architecture.md` §1 et le briefing commercial à la racine de `Documents/perso/`.)
3. **Toujours pousser sur les DEUX remotes** : `git push origin HEAD:main` **ET** `git push scalingo HEAD:main`. Jamais un seul.
4. **Vérifier, ne pas supposer** : vrai `npm run build` + vrai boot + vrai test (curl / restauration / e2e) avant de dire « c'est fait ». `tsc` seul ne suffit pas — et le build de prod **ignore** les erreurs de type et de lint (`next.config.mjs`).
5. **Pas d'`ALTER TABLE` manuel en prod.** Tout changement de schéma passe par une migration (`.claude/docs/operations.md` §Migrations). Les DDL directes sur la base de prod sont bloquées par le garde-fou du mode auto — passer par l'utilisateur avec le SQL exact.
6. **Confirmer avant toute action vers l'extérieur ou à coût** (montée en gamme de conteneur, envoi d'email, modification directe de la prod, enregistrement DNS). Avant tout `git checkout` / `reset` / `rm -rf` : `git status` d'abord.

---

## Où lire quoi

| Besoin | Fichier |
|---|---|
| Stack, modèle multi-tenant, 3 rôles, console super-admin, carte du repo, variables d'env | [`.claude/docs/architecture.md`](.claude/docs/architecture.md) |
| Modèle de contenu Payload : gabarits, menu, collections, ce que l'éditeur peut / ne peut pas | [`.claude/docs/content-model.md`](.claude/docs/content-model.md) |
| Dev local + pièges, déploiement, migrations, infra, sauvegardes, monitoring, export | [`.claude/docs/operations.md`](.claude/docs/operations.md) |
| Journal chronologique des décisions produit (97 entrées, archive verbatim) | [`.claude/docs/decisions-log.md`](.claude/docs/decisions-log.md) |

Ordre de lecture conseillé pour une reprise de contexte à froid : `architecture.md` → `operations.md` → `content-model.md`. Le journal ne se lit pas en entier : c'est une référence à consulter au besoin.
