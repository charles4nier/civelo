import path from 'path';
import { fileURLToPath } from 'url';
import { withPayload } from '@payloadcms/next/withPayload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
	},
	sassOptions: {
		includePaths: [path.join(__dirname, 'shared/styles')],
		prependData: `@import "variables.scss";`
	},
	compress: true,
	eslint: {
		ignoreDuringBuilds: true
	},
	typescript: {
		ignoreBuildErrors: true
	},
	poweredByHeader: false,
	webpack: (config) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@shared': path.join(__dirname, 'shared'),
			'@features': path.join(__dirname, 'features'),
			'@types': path.join(__dirname, 'types')
		};
		return config;
	}
};

export default withPayload(nextConfig);
