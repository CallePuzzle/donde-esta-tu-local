import { PrismaClient } from '@prisma/client';

import { SeedActivity, type SeedActivityType } from './seed-activity';

async function SeedActivities(prisma: PrismaClient) {
	console.log('🎉 Seeding activities...');

	const activities: SeedActivityType[] = [
		{
			name: 'XX Concurso de limonada',
			date: new Date('2025-09-12T17:30:00.000Z'),
			desc: 'Salida desde la plaza mayor'
		},
		{
			name: 'VI Babrera Circus Party con Chupitada',
			date: new Date('2025-09-12T22:30:00.000Z'),
			placeGangName: 'La Babrera',
			organisingGangNames: ['La Babrera', 'KPY']
		},
		{
			name: 'Trucha Sound Festival X - Sidrada',
			date: new Date('2025-09-13T19:00:00.000Z'),
			dateDesc: 'Después del pregón',
			placeGangName: 'Los Bugas',
			organisingGangNames: ['Los Bugas']
		},
		{
			name: 'V Danza del Sapo',
			date: new Date('2025-09-14T02:00:00.000Z'),
			dateDesc: 'Después del baile',
			placeGangName: 'El Desmadre',
			organisingGangNames: ['El Desmadre']
		},
		{
			name: 'II La Chanidad',
			date: new Date('2025-09-15T14:00:00.000Z'),
			placeGangName: 'El K-pote',
			organisingGangNames: ['El K-pote']
		},
		{
			name: 'Meterla en la viga',
			date: new Date('2025-09-15T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Badulake',
			organisingGangNames: ['Badulake']
		},
		{
			name: 'El Corzo',
			date: new Date('2025-09-15T21:59:00.000Z'),
			placeGangName: 'La movida',
			organisingGangNames: ['La movida']
		},
		{
			name: 'Juego el Pañuelo',
			date: new Date('2025-09-16T1:00:00.000Z'),
			dateDesc: 'Descanso del baile',
			placeGangName: '13 la víspera',
			organisingGangNames: ['13 la víspera']
		},
		{
			name: 'Viva el Vino Uve Palito',
			date: new Date('2025-09-16T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Talanquera',
			organisingGangNames: ['Talanquera']
		},
		{
			name: 'III Bingo bingo',
			date: new Date('2025-09-17T1:00:00.000Z'),
			dateDesc: 'Descanso del baile',
			desc: 'En el baile',
			organisingGangNames: ['La Babrera']
		},
		{
			name: 'II El Komplote',
			date: new Date('2025-09-17T02:00:00.000Z'),
			dateDesc: 'Después del baile',
			placeGangName: 'El K-pote',
			organisingGangNames: ['El K-pote']
		},
		{
			name: 'Charanga La Resaka',
			date: new Date('2025-09-17T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Las druidas'
		},
		{
			name: 'Vermut la Bodega',
			date: new Date('2025-09-18T11:30:00.000Z'),
			desc: 'Raúl'
		},
		{
			name: 'Tardeo',
			date: new Date('2025-09-18T14:30:00.000Z'),
			placeGangName: 'Las Nomadas',
			organisingGangNames: ['Las Nomadas']
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
