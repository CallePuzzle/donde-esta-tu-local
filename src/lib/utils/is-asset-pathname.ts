const ASSET_PATHNAME_PATTERN = /\.(?:ico|png|jpe?g|svg|webp|json|txt|xml|webmanifest)$/;

export function isAssetPathname(pathname: string): boolean {
	return (
		pathname.startsWith('/_app/') ||
		pathname === '/service-worker.js' ||
		ASSET_PATHNAME_PATTERN.test(pathname)
	);
}
