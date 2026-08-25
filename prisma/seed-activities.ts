import { PrismaClient } from '@prisma/client';

import { SeedActivity, type SeedActivityType } from './seed-activity';

async function SeedActivities(prisma: PrismaClient) {
	console.log('🎉 Seeding activities...');

	const activities: SeedActivityType[] = [
		{
			name: 'XX Concurso de limonada',
			date: new Date('2025-09-12T17:30:00.000Z'),
			placeDesc: 'Salida desde la plaza mayor'
		},
		{
			name: 'Tractor Dance',
			date: new Date('2025-09-12T22:30:00.000Z'),
			placeDesc: 'Salida desde la plaza de toros',
			bannerPath: '/src/lib/assets/actividades/tractor.png'
		},
		{
			name: 'VI Babrera Circus Party con Chupitada',
			date: new Date('2025-09-13T00:00:00.000Z'),
			placeGangName: 'La Babrera',
			collaboratingGangNames: ['KPY'],
			bannerPath: '/src/lib/assets/actividades/circus-party.png'
		},
		{
			name: 'Trucha Sound Festival X - Sidrada',
			date: new Date('2025-09-13T19:00:00.000Z'),
			dateDesc: 'Después del pregón',
			placeGangName: 'Los Bugas',
			bannerPath: '/src/lib/assets/actividades/trucha-sound.png'
		},
		{
			name: 'V Danza del Sapo',
			date: new Date('2025-09-13T21:59:59.000Z'),
			dateDesc: 'Después del baile',
			placeGangName: 'El Desmadre'
		},
		{
			name: 'Fiesta Techno',
			date: new Date('2025-09-14T11:00:00.000Z'),
			dateDesc: 'Después del encierro',
			placeGangName: 'As de copas',
			bannerPath: '/src/lib/assets/actividades/fiesta-techno-as-de-copas.jpg'
		},
		{
			name: 'Tardeo',
			date: new Date('2025-09-14T14:30:00.000Z'),
			placeGangName: 'Los Nicks',
			bannerPath: '/src/lib/assets/actividades/tardo-niks.jpg'
		},
		{
			name: 'III La Chanidad',
			date: new Date('2025-09-15T14:00:00.000Z'),
			placeGangName: 'El K-pote',
			bannerPath: '/src/lib/assets/actividades/la-chanidad.jpg'
		},
		{
			name: 'Meterla en la viga',
			date: new Date('2025-09-15T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Badulake',
			bannerPath: '/src/lib/assets/actividades/badulaque-punta.jpg'
		},
		{
			name: 'El Corzo',
			date: new Date('2025-09-15T21:59:00.000Z'),
			placeGangName: 'La movida',
			bannerPath: '/src/lib/assets/actividades/fiesta-del-corzo.png'
		},
		{
			name: 'Juego el Pañuelo',
			date: new Date('2025-09-15T21:59:01.000Z'),
			dateDesc: 'Descanso del baile',
			placeGangName: '13 la víspera'
		},
		{
			name: 'Viva el Vino Uve Palito',
			date: new Date('2025-09-16T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Talanquera'
		},
		{
			name: 'III Bingo bingo',
			date: new Date('2025-09-16T21:59:01.000Z'),
			dateDesc: 'Descanso del baile',
			placeDesc: 'En el baile'
		},
		{
			name: 'II El Komplote',
			date: new Date('2025-09-16T21:59:02.000Z'),
			dateDesc: 'Después del baile',
			placeGangName: 'El K-pote'
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
			placeGangName: 'La bodega de Raúl'
		},
		{
			name: 'Tardeo',
			date: new Date('2025-09-18T14:30:00.000Z'),
			placeGangName: 'Las Nomadas',
			bannerPath: '/src/lib/assets/actividades/tardeo-nomadas.jpg'
		},
		// 2026
		{
			name: 'XXI Concurso de limonada',
			date: new Date('2026-09-09T17:30:00.000Z'),
			placeDesc: 'Inicio desde la plaza'
		},
		{
			name: 'Fiesta Las Nomadas',
			date: new Date('2026-09-09T20:30:00.000Z'),
			dateDesc: 'Después de la limonada',
			placeGangName: 'Las Nomadas'
		},
		{
			name: 'XI Trucha Sound Festival - Sidrada',
			date: new Date('2026-09-10T19:00:00.000Z'),
			dateDesc: 'Después del pregón',
			placeGangName: 'Los Bugas'
		},
		{
			name: 'Fiesta La Teja',
			date: new Date('2026-09-10T02:00:00.000Z'),
			placeGangName: 'ALOK2'
		},
		{
			name: 'Pascual Race - Carrera de motos para niños de 0 a 4 años',
			date: new Date('2026-09-11T11:00:00.000Z'),
			placeDesc: 'Confirmar asistencia a (+34 617 14 84 19)'
		},
		{
			name: 'XX Aniversario Contentongo',
			date: new Date('2026-09-11T14:00:00.000Z'),
			dateDesc: '16:00 a 19:00',
			placeGangName: 'Contenta me tienes'
		},
		{
			name: 'V Danza del Sapo',
			date: new Date('2026-09-11T03:00:00.000Z'),
			dateDesc: '05:00 a 08:00',
			placeGangName: 'El Desmadre'
		},
		{
			name: 'VII Babrera Circus Party con Chupitada',
			date: new Date('2026-09-12T13:30:00.000Z'),
			dateDesc: '15:30 a 18:00',
			placeGangName: 'La Babrera',
			collaboratingGangNames: ['KPY']
		},
		{
			name: 'XV Meterla en la viga',
			date: new Date('2026-09-12T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Badulake'
		},
		{
			name: 'III Fiesta del Corzo',
			date: new Date('2026-09-12T21:59:00.000Z'),
			dateDesc: 'De encierro a encierro',
			placeGangName: 'La movida'
		},
		{
			name: 'Concierto Flamenco Pop-Rock con Aarón Miguel',
			date: new Date('2026-09-13T13:30:00.000Z'),
			dateDesc: '15:30',
			placeGangName: 'Las druidas',
			collaboratingGangNames: ['La Gres-k']
		},
		{
			name: 'Viva el Vino Uve Palito',
			date: new Date('2026-09-13T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Talanquera'
		},
		{
			name: 'Juego del Pañuelo',
			date: new Date('2026-09-13T21:59:01.000Z'),
			dateDesc: 'Descanso del baile',
			placeGangName: '13 la víspera'
		},
		{
			name: 'Fiesta La Talankera',
			date: new Date('2026-09-14T21:00:00.000Z'),
			dateDesc: 'Por la noche',
			placeGangName: 'Talanquera'
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
