import { NextResponse, type NextRequest } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { getPayloadClient } from '@lib/payload';

const execFileAsync = promisify(execFile);

// Sert l'action "Exporter le site" de la popin de réglages
// (`admin/MesSites/SiteSettingsMenu.tsx`) — pas une opération CRUD sur une
// collection, donc pas de route Payload générée automatiquement.
//
// Enchaîne les deux scripts CLI déjà écrits et testés (`export-tenant.ts`
// puis `build-tenant-archive.ts`) en sous-processus plutôt que de les
// importer directement : ils font tous les deux leur propre
// `getPayload({ config })`, ont un `process.exit()` en sortie normale, et
// ont été validés dans cet état exact par `scripts/e2e-archive-test.sh`
// (20/20). Les réimporter en process aurait un comportement non vérifié.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const payload = await getPayloadClient();

	const { user } = await payload.auth({ headers: request.headers });
	if (!user || user.role !== 'super-admin') {
		return NextResponse.json({ message: 'Accès réservé au super-admin.' }, { status: 403 });
	}

	const tenant = await payload
		.findByID({ collection: 'tenants', id, overrideAccess: true, depth: 0 })
		.catch(() => null);
	if (!tenant) {
		return NextResponse.json({ message: 'Site introuvable.' }, { status: 404 });
	}

	const domaine = String(tenant.domaine ?? '');
	const theme = String(tenant.theme ?? '');
	const slug = domaine
		.replace(/\.[a-z]+$/i, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	if (!domaine || !theme || !slug) {
		return NextResponse.json({ message: 'Site mal configuré (domaine/thème manquant).' }, { status: 400 });
	}

	const repoRoot = path.resolve(process.cwd());
	const workDir = await mkdtemp(path.join(tmpdir(), `tenant-export-${slug}-`));
	const exportDir = path.join(workDir, 'export');
	const today = new Date().toISOString().slice(0, 10);
	const archiveName = `${slug}-${today}`;
	const zipPath = path.join(repoRoot, 'exports', '_build', `${archiveName}.zip`);
	const buildRoot = path.join(repoRoot, 'exports', '_build', archiveName);

	// Le site public/l'admin tournent déjà sur ce même hôte — inutile de
	// solliciter le vrai domaine de la commune (pas forcément joignable
	// depuis ce conteneur) pour rapatrier ses propres médias.
	const baseUrl = request.nextUrl.origin;

	try {
		await execFileAsync(
			'node',
			['--experimental-loader=./scripts/_resolve-ts.mjs', 'scripts/export-tenant.ts', `--domaine=${domaine}`, `--out=${exportDir}`, `--base-url=${baseUrl}`],
			{ cwd: repoRoot, env: { ...process.env, EXPORT_TENANT_YES: '1' }, maxBuffer: 1024 * 1024 * 50 }
		);

		await execFileAsync(
			'node',
			['--experimental-loader=./scripts/_resolve-ts.mjs', 'scripts/build-tenant-archive.ts', `--export=${exportDir}`, `--theme=${theme}`, `--slug=${slug}`],
			{ cwd: repoRoot, env: process.env, maxBuffer: 1024 * 1024 * 50 }
		);

		const zipBuffer = await readFile(zipPath);

		return new NextResponse(new Uint8Array(zipBuffer), {
			status: 200,
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${archiveName}.zip"`,
				'Content-Length': String(zipBuffer.byteLength)
			}
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error('[tenant-export] Échec de la génération de l\'archive.', err);
		return NextResponse.json({ message: `Échec de la génération de l'archive : ${message.slice(0, 500)}` }, { status: 500 });
	} finally {
		await rm(workDir, { recursive: true, force: true }).catch(() => {});
		await rm(buildRoot, { recursive: true, force: true }).catch(() => {});
		await rm(zipPath, { force: true }).catch(() => {});
	}
}
