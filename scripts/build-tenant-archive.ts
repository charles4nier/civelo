/**
 * Assemble une archive livrable autonome pour un tenant déjà exporté (voir
 * `scripts/export-tenant.ts`) : copie du code (thème unique, scripts
 * internes retirés), `data/`/`medias/` déjà produits, `scripts/import.ts`,
 * `.env.example`, `docker-compose.yml`, `DEPLOIEMENT.md`, checklist
 * sécurité bloquante, puis zip.
 *
 * Usage :
 *   node --env-file=.env --experimental-loader=./scripts/_resolve-ts.mjs \
 *     scripts/build-tenant-archive.ts --export=./exports/saint-hilaire-bonneval --theme=edito --slug=saint-hilaire-bonneval
 *
 * Suppose que `export-tenant.ts` a déjà tourné vers `--export` (contient
 * déjà `data/` et `medias/`).
 */
import { cp, mkdir, readFile, writeFile, readdir, rm, stat } from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');

type Args = { export?: string; theme?: string; slug?: string };
function parseArgs(): Args {
	const args: Args = {};
	for (const arg of process.argv.slice(2)) {
		const m = arg.match(/^--([^=]+)=(.*)$/);
		if (m) (args as any)[m[1]] = m[2];
	}
	return args;
}

const THEMES = ['edito', 'moderne', 'accueillant', 'classique'] as const;
type Theme = (typeof THEMES)[number];

// Fichiers/dossiers jamais livrés — infra interne, scripts qui parlent à
// notre base/S3/Scalingo, historique git (contient les autres clients).
const EXCLUDE_ALWAYS = [
	'.git',
	'node_modules',
	'.next',
	'exports',
	'data',
	'medias',
	'.env',
	'.env.local',
	'PAYLOAD-CMS.md',
	'docker-compose.yml', // remplacé par la version de l'archive
	'scripts/export-tenant.ts',
	'scripts/build-tenant-archive.ts',
	'scripts/import-tenant.template.ts',
	'scripts/seed.ts',
	'scripts/seed-icones.ts',
	'scripts/seed-site-settings.ts',
	'scripts/seed-default-pages-for-tenant.ts',
	'scripts/migrate-mongo-to-postgres.ts',
	'scripts/gen-importmap.ts',
	'scripts/tmp-check-users.ts', // scripts jetables laissés par erreur pendant cette session — ne pas livrer
	'scripts/tmp-list-tenants.ts',
	'scripts/tmp-check-tenant-state.ts',
	'scripts/tmp-create-home-tenant.ts',
	'tests' // suite d'isolation multi-tenant, sans objet pour une archive mono-tenant
];

async function pathExists(p: string): Promise<boolean> {
	try {
		await stat(p);
		return true;
	} catch {
		return false;
	}
}

async function copyRepo(destDir: string) {
	await mkdir(destDir, { recursive: true });
	const entries = await readdir(REPO_ROOT);
	for (const entry of entries) {
		if (EXCLUDE_ALWAYS.includes(entry)) continue;
		await cp(path.join(REPO_ROOT, entry), path.join(destDir, entry), {
			recursive: true,
			filter: (src) => {
				const rel = path.relative(REPO_ROOT, src);
				return !EXCLUDE_ALWAYS.some((ex) => rel === ex || rel.startsWith(ex + path.sep));
			}
		});
	}
}

// --- Filtrage des thèmes : ne garder que celui du tenant ---
async function stripOtherThemes(destDir: string, keep: Theme) {
	for (const theme of THEMES) {
		if (theme === keep) continue;
		await rm(path.join(destDir, 'themes', theme), { recursive: true, force: true });
	}
}

// Réécrit les ~18 fichiers de route qui importent les 3 thèmes et
// choisissent via `pickTheme(theme, {...})` — motif uniforme, vérifié dans
// le dépôt avant d'écrire cette fonction (18 fichiers conformes, 1
// exception traitée à part ci-dessous). Garde uniquement l'import du thème
// choisi, remplace l'appel `pickTheme(...)` par l'identifiant survivant.
async function stripThemeDispatch(destDir: string, keep: Theme) {
	const appDir = path.join(destDir, 'app');
	const files = await findFiles(appDir, '.tsx');
	let rewritten = 0;
	for (const file of files) {
		let content = await readFile(file, 'utf-8');
		if (!content.includes('pickTheme(theme')) continue;

		const importLineRe = /^import .* from '@themes\/(edito|moderne|accueillant|classique)\/[^']*';\n/gm;
		const importsByTheme: Partial<Record<Theme, string>> = {};
		for (const match of content.matchAll(importLineRe)) {
			const theme = match[1] as Theme;
			const identMatch = match[0].match(/^import (?:type )?(\w+)/);
			if (identMatch) importsByTheme[theme] = identMatch[1];
		}
		const keptIdent = importsByTheme[keep];
		if (!keptIdent) {
			throw new Error(`${file} : impossible de trouver l'import du thème "${keep}" à conserver.`);
		}

		// Retire les lignes d'import des 2 thèmes non conservés.
		content = content.replace(importLineRe, (line, theme: Theme) => (theme === keep ? line : ''));

		// `pickTheme(theme, { edito: X, app: Y, accueillant: Z })` → `X`
		// (ou Y/Z selon le thème conservé) — motif sur une seule expression,
		// peut s'étendre sur plusieurs lignes.
		const pickThemeCallRe = /pickTheme\(\s*theme\s*,\s*\{[^}]*\}\s*\)/s;
		if (!pickThemeCallRe.test(content)) throw new Error(`${file} : appel pickTheme(theme, {...}) non trouvé pour réécriture.`);
		content = content.replace(pickThemeCallRe, keptIdent);

		await writeFile(file, content);
		rewritten++;
	}
	console.log(`  ✓ ${rewritten} route(s) réécrite(s) pour ne garder que le thème "${keep}"`);
}

// Exception au motif uniforme ci-dessus — branchement if/else par thème au
// lieu d'un objet `pickTheme`, avec en plus des données de repli par thème
// (`@themes/<theme>/features/carte/data`). Traité à la main : plus sûr
// qu'un motif générique sur un fichier qui ne suit pas la même forme.
async function stripCarteInteractive(destDir: string, keep: Theme) {
	const file = path.join(destDir, 'app', '(frontend)', 'tourisme', 'carte-interactive', 'page.tsx');
	if (!(await pathExists(file))) return;
	const label = { edito: 'StyleEdito', moderne: 'Moderne', accueillant: 'Accueillant', classique: 'Classique' }[keep];
	const varPrefix = { edito: 'edito', moderne: 'moderne', accueillant: 'accueillant', classique: 'classique' }[keep];
	const content = `import type { Metadata } from 'next';
import { generatePageMetadata } from '@themes/edito/config/seo';
import ${label}CarteInteractive from '@themes/${keep}/features/carte';
import { pois as ${varPrefix}FallbackPois, sentiers as ${varPrefix}FallbackSentiers } from '@themes/${keep}/features/carte/data';
import { getCarteData } from '@lib/payload';

export const metadata: Metadata = generatePageMetadata({
	title: 'Carte interactive',
	description: 'Explorez la commune grâce à notre carte interactive.',
	path: '/tourisme/carte-interactive'
});

type PageProps = {
	searchParams: Promise<{ category?: string; id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
	const { id } = await searchParams;
	const data = await getCarteData();
	return (
		<${label}CarteInteractive initialId={id} pois={data?.pois ?? ${varPrefix}FallbackPois} sentiers={data?.sentiers ?? ${varPrefix}FallbackSentiers} />
	);
}
`;
	await writeFile(file, content);
	console.log('  ✓ tourisme/carte-interactive/page.tsx réécrit (cas particulier, hors motif pickTheme)');
}

async function findFiles(dir: string, ext: string): Promise<string[]> {
	const out: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await findFiles(full, ext)));
		else if (entry.name.endsWith(ext)) out.push(full);
	}
	return out;
}

// --- Fichiers générés (Dockerfile, docker-compose.yml, .env.example, DEPLOIEMENT.md) ---

// Version Node de production — pas fixée dans le dépôt d'origine (aucun
// `.nvmrc`/`engines`, Scalingo détecte automatiquement), vérifiée à la main
// via `scalingo run node --version` avant d'écrire cette fonction plutôt
// que supposée. Fixée ici en dur : l'archive a besoin d'une version
// garantie, contrairement au dépôt d'origine.
const NODE_VERSION = '24';
const POSTGRES_VERSION = '16';

function dockerfileContent(): string {
	// Le build Next.js (`next build`) initialise Payload — même pour ne
	// générer que des pages dynamiques, ça exige une base Postgres
	// JOIGNABLE (vérifié en le laissant dans l'image : `docker build`
	// n'a accès à aucun service du compose, la construction échoue avec
	// "missing secret key"/connexion refusée). Repoussé au DÉMARRAGE du
	// conteneur plutôt qu'à la construction de l'image : à ce moment,
	// `depends_on.condition: service_healthy` (docker-compose.yml) garantit
	// que `db` répond déjà.
	return `FROM node:${NODE_VERSION}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# \`scripts/import.ts\` (mise en place initiale) vit hors de /app, monté en
# volume à la racine du conteneur (voir docker-compose.yml et
# DEPLOIEMENT.md) — sans ce lien, la résolution de module de Node.js, qui
# ne regarde que les dossiers parents du fichier exécuté, ne trouverait
# jamais /app/node_modules depuis /scripts. Repéré en testant l'archive
# avec un vrai \`docker compose exec\` (Cannot find package 'payload').
RUN ln -s /app/node_modules /node_modules
EXPOSE 3000
CMD ["sh", "-c", "npm run build && npm start"]
`;
}

function dockerComposeContent(slug: string): string {
	return `# Généré par scripts/build-tenant-archive.ts — voir DEPLOIEMENT.md.
services:
  db:
    image: postgres:${POSTGRES_VERSION}
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${slug}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: ${slug}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${slug}"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    build: ./app
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URI: postgres://${slug}:\${DB_PASSWORD}@db:5432/${slug}
      PAYLOAD_SECRET: \${PAYLOAD_SECRET}
      SINGLE_TENANT_SLUG: ${slug}
    ports:
      - "3000:3000"
    volumes:
      - ./app/media:/app/media
      - ./app/documents:/app/documents
      # \`scripts/import.ts\` (mise en place initiale) et les données/médias
      # à importer vivent à la racine de l'archive, hors du contexte de
      # build de \`app/\` — montés ici pour que \`docker compose exec\` (voir
      # DEPLOIEMENT.md) puisse les lire depuis le conteneur.
      - ./scripts:/scripts
      - ./data:/data
      - ./medias:/medias

volumes:
  db-data:
`;
}

function envExampleContent(slug: string): string {
	return `# Copier en .env et remplir avant de lancer \`docker compose up\`.

# Mot de passe de la base Postgres — choisir une valeur, n'importe laquelle,
# juste cohérente entre ce fichier et vous-même (docker-compose s'en sert
# pour créer la base ET pour s'y connecter).
DB_PASSWORD=

# Chaîne aléatoire longue, sert à signer les sessions admin — générer par
# exemple avec: openssl rand -base64 32
PAYLOAD_SECRET=

# Ne pas modifier — identifie ce site comme mono-tenant.
SINGLE_TENANT_SLUG=${slug}
`;
}

function deploiementMdContent(args: { slug: string; nom: string; theme: string }): string {
	const { slug, nom, theme } = args;
	return `# Déploiement — ${nom}

Ce dossier contient un site autonome (Next.js + Payload CMS + PostgreSQL),
extrait de notre plateforme. Il ne dépend plus de notre infrastructure —
vous pouvez l'héberger où vous le souhaitez.

## Prérequis

- Docker et Docker Compose (c'est tout — la base de données et l'application
  tournent toutes les deux dans des conteneurs, aucune installation de
  Node.js ou PostgreSQL n'est nécessaire sur la machine hôte)

## Démarrage en local

\`\`\`
cp .env.example .env
# remplir DB_PASSWORD et PAYLOAD_SECRET dans .env (voir les commentaires du fichier)
docker compose up --build
\`\`\`

Au tout premier démarrage, une fois les conteneurs prêts, importez les
données du site (une seule fois — inutile de le refaire aux démarrages
suivants) :

\`\`\`
docker compose exec app node --experimental-loader=./scripts/_resolve-ts.mjs /scripts/import.ts
\`\`\`

Le site public est ensuite sur http://localhost:3000, l'administration sur
http://localhost:3000/admin.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| \`DB_PASSWORD\` | Mot de passe de la base PostgreSQL (choisi par vous) |
| \`PAYLOAD_SECRET\` | Clé de signature des sessions admin — à garder secrète |
| \`SINGLE_TENANT_SLUG\` | Ne pas modifier, identifie ce site comme mono-tenant |

## Se connecter au back-office la première fois

Aucun compte n'est créé automatiquement. Après le premier import, créez un
compte administrateur :

\`\`\`
docker compose exec app node --experimental-loader=./scripts/_resolve-ts.mjs scripts/create-admin-user.ts votre@email.fr un-mot-de-passe
\`\`\`

## Où héberger ce site

Ce dossier tourne sur n'importe quel hébergeur qui accepte Docker Compose.
Quelques ordres de grandeur (tarifs à vérifier au moment de choisir, ils
évoluent) :

- Un VPS chez OVH, Hetzner, Scaleway : environ 5 à 15 €/mois pour ce site
- Scalingo, Railway, Render (PaaS avec support Docker) : environ 15 à 30 €/mois,
  plus simple à opérer mais un peu plus cher
- Auto-hébergement sur un serveur déjà possédé : coût marginal

Thème du site : **${theme}**. Tenant : **${slug}**.

## Ce qui N'EST PAS inclus

- Aucun support technique de notre part sur ce dossier une fois livré
- Aucune garantie de fonctionnement continu ni de mise à jour de sécurité
  automatique — c'est un instantané du code à la date de l'export
- Aucun envoi d'email n'est configuré (formulaires de contact, etc.) — à
  brancher sur votre propre fournisseur SMTP si besoin

## À reconfigurer par le repreneur

- **Nom de domaine** — pointer votre domaine vers le serveur qui héberge
  ces conteneurs, et ajouter un reverse proxy HTTPS devant (Caddy, Traefik,
  nginx + certbot...) — ce \`docker-compose.yml\` sert le site en HTTP simple
  sur le port 3000, sans certificat
- **Email/SMTP** — pour l'instant les emails (réinitialisation de mot de
  passe...) s'affichent seulement dans les logs du conteneur \`app\`
- **Stockage des fichiers** — les médias sont stockés sur disque, dans les
  volumes \`./app/media\` et \`./app/documents\` (déjà montés dans le
  \`docker-compose.yml\`) ; à sauvegarder comme le reste de vos données
`;
}

// --- Checklist sécurité — bloquante, échoue au lieu d'avertir ---
async function securityChecklist(buildRoot: string, opts: { theme: Theme; expectedTenantId: string | number }) {
	const problems: string[] = [];

	// Aucun secret / .env réel.
	if (await pathExists(path.join(buildRoot, 'app', '.env'))) problems.push('un ".env" réel est présent dans app/ (seul .env.example doit l\'être)');
	const allFiles = await findFiles(buildRoot, '');
	for (const file of allFiles) {
		if (path.basename(file) === '.env') problems.push(`fichier .env trouvé : ${path.relative(buildRoot, file)}`);
	}

	// Aucun .git (historique = autres clients).
	if (await pathExists(path.join(buildRoot, 'app', '.git'))) problems.push('.git présent dans app/ (contient l\'historique des autres clients)');

	// Aucun autre thème que celui du client.
	for (const t of THEMES) {
		if (t === opts.theme) continue;
		if (await pathExists(path.join(buildRoot, 'app', 'themes', t))) problems.push(`thème non retenu encore présent : themes/${t}`);
	}

	// Aucune URL vers notre bucket/API dans les données exportées.
	const dataFiles = await findFiles(path.join(buildRoot, 'data'), '.json');
	for (const file of dataFiles) {
		const content = await readFile(file, 'utf-8');
		if (content.includes('/api/media/file/') || content.includes('ovh.net') || content.includes('amazonaws')) {
			problems.push(`URL vers notre instance/bucket encore présente dans ${path.relative(buildRoot, file)}`);
		}
	}

	// Aucune donnée d'un autre tenant dans les JSON exportés.
	for (const file of dataFiles) {
		const content = await readFile(file, 'utf-8');
		const parsed = JSON.parse(content);
		const docs = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
		for (const doc of docs) {
			if (doc && typeof doc === 'object' && 'tenant' in doc && doc.tenant != null && String(doc.tenant) !== String(opts.expectedTenantId)) {
				problems.push(`document d'un autre tenant (${doc.tenant}) dans ${path.relative(buildRoot, file)}`);
			}
		}
	}

	// Aucun script interne (parle à notre base/S3/Scalingo directement).
	for (const forbidden of ['export-tenant.ts', 'build-tenant-archive.ts', 'seed.ts', 'migrate-mongo-to-postgres.ts']) {
		if (await pathExists(path.join(buildRoot, 'app', 'scripts', forbidden))) problems.push(`script interne encore présent : scripts/${forbidden}`);
	}

	if (problems.length > 0) {
		throw new Error(`Checklist sécurité échouée :\n  - ${problems.join('\n  - ')}`);
	}
	console.log(`  ✓ checklist sécurité (${THEMES.length - 1} thèmes exclus vérifiés, pas de secret, pas de fuite inter-tenant)`);
}

async function zipArchive(buildRoot: string, archiveName: string): Promise<string> {
	const outZip = path.join(path.dirname(buildRoot), `${archiveName}.zip`);
	await execFileAsync('zip', ['-r', '-q', outZip, archiveName], { cwd: path.dirname(buildRoot) });
	return outZip;
}

async function main() {
	const { export: exportDir, theme, slug } = parseArgs();
	if (!exportDir || !theme || !slug) {
		console.error(
			'Usage: build-tenant-archive.ts --export=<dossier exporté> --theme=<edito|moderne|accueillant|classique> --slug=<identifiant archive>'
		);
		process.exit(1);
	}
	if (!THEMES.includes(theme as Theme)) {
		console.error(`Thème inconnu : "${theme}". Attendu : ${THEMES.join(', ')}.`);
		process.exit(1);
	}
	const resolvedExportDir = path.resolve(exportDir);
	if (!(await pathExists(path.join(resolvedExportDir, 'data', 'tenant.json')))) {
		console.error(`"${resolvedExportDir}/data/tenant.json" introuvable — lancer export-tenant.ts d'abord.`);
		process.exit(1);
	}

	const today = new Date().toISOString().slice(0, 10);
	const archiveName = `${slug}-${today}`;
	const buildRoot = path.resolve(REPO_ROOT, 'exports', '_build', archiveName);
	await rm(buildRoot, { recursive: true, force: true });
	const appDest = path.join(buildRoot, 'app');

	console.log(`Assemblage de l'archive "${archiveName}"…`);
	console.log('  → copie du code…');
	await copyRepo(appDest);

	console.log('  → filtrage des thèmes…');
	await stripOtherThemes(appDest, theme as Theme);
	await stripThemeDispatch(appDest, theme as Theme);
	await stripCarteInteractive(appDest, theme as Theme);

	console.log('  → copie des données exportées…');
	await cp(path.join(resolvedExportDir, 'data'), path.join(buildRoot, 'data'), { recursive: true });
	await cp(path.join(resolvedExportDir, 'medias'), path.join(buildRoot, 'medias'), { recursive: true });

	// `scripts/import.ts` vit À LA RACINE de l'archive (frère de `app/`,
	// `data/`, `medias/` — voir la structure attendue en tête de fichier),
	// pas dans `app/scripts/` : c'est un script de mise en place unique,
	// pas un script interne de l'appli elle-même.
	console.log('  → script d\'import…');
	await mkdir(path.join(buildRoot, 'scripts'), { recursive: true });
	await cp(path.join(REPO_ROOT, 'scripts', 'import-tenant.template.ts'), path.join(buildRoot, 'scripts', 'import.ts'));

	console.log('  → Dockerfile / docker-compose.yml / .env.example / DEPLOIEMENT.md…');
	const tenantData = JSON.parse(await readFile(path.join(buildRoot, 'data', 'tenant.json'), 'utf-8'));
	await writeFile(path.join(appDest, 'Dockerfile'), dockerfileContent());
	await writeFile(path.join(buildRoot, 'docker-compose.yml'), dockerComposeContent(slug));
	await writeFile(path.join(buildRoot, '.env.example'), envExampleContent(slug));
	await writeFile(path.join(buildRoot, 'DEPLOIEMENT.md'), deploiementMdContent({ slug, nom: tenantData.nom, theme }));

	console.log('  → checklist sécurité…');
	await securityChecklist(buildRoot, { theme: theme as Theme, expectedTenantId: tenantData.id });

	console.log('  → zip…');
	const zipPath = await zipArchive(buildRoot, archiveName);

	console.log(`\nArchive prête : ${zipPath}`);
	console.log('ARCHIVE_ZIP=' + zipPath);
	process.exit(0);
}

main().catch((err) => {
	console.error('ÉCHEC:', err);
	process.exit(1);
});
