import { PrismaClient } from '@prisma/client';

import { SeedActivity, type SeedActivityType } from './seed-activity';

async function SeedActivities(prisma: PrismaClient) {
	console.log('🎉 Seeding activities...');

	const activities: SeedActivityType[] = [
		{
			name: 'XX Concurso de limonada año pasado',
			date: new Date('2024-09-12T17:30:00.000Z'),
			placeDesc: 'Salida desde la plaza mayor'
		},
		{
			name: 'VI Babrera Circus Party con Chupitada año pasado',
			date: new Date('2024-09-12T22:30:00.000Z'),
			placeGangName: 'La Babrera',
			collaboratingGangNames: ['KPY']
		},
		{
			name: 'VI Babrera Circus Party con Chupitada dentro de nada',
			date: new Date(Date.now() + 45 * 60 * 1000),
			placeGangName: 'La Babrera',
			collaboratingGangNames: ['KPY']
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
