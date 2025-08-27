import { PrismaClient } from '@prisma/client';
import { SeedGangs } from './seed-gangs';
import { SeedActivities } from './seed-activities';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting seed...');

	await SeedGangs(prisma);
	await SeedActivities(prisma);

	console.log('🌱 Seed completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
