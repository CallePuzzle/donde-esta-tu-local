import { PrismaClient } from '@prisma/client';

import { SeedActivity, type SeedActivityType } from './seed-activity';

async function SeedActivities(prisma: PrismaClient) {
	// Clear existing gangs
	// await prisma.activity.deleteMany();
	console.log('✅ Cleared existing activities');

	console.log('🎉 Seeding activities...');

	const activities: SeedActivityType[] = [
		{
			name: 'XX Concurso de limonada',
			date: new Date('2025-09-12T17:30:00.000Z'),
			desc: 'Salida desde la plaza mayor'
		}
	];

	for (const activity of activities) {
		console.log(activity);
		await SeedActivity(prisma, activity);
	}
}

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting seed...');

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
