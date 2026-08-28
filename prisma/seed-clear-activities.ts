import { PrismaClient } from '$lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { requireDirectDatabaseUrl } from '$lib/server/database-url';

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: requireDirectDatabaseUrl() })
});

async function main() {
	const now = new Date();
	const year = now.getFullYear();
	const startOfYear = new Date(Date.UTC(year, 0, 1));
	const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));

	console.log(`🧹 Borrando actividades del año ${year}...`);

	const result = await prisma.activity.deleteMany({
		where: {
			date: {
				gte: startOfYear,
				lt: startOfNextYear
			}
		}
	});

	console.log(`🗑️  ${result.count} actividad(es) borrada(s) del año ${year}.`);
}

main()
	.catch((e) => {
		console.error('❌ Error limpiando actividades:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
