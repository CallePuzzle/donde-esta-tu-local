import { PrismaClient } from '$lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { requireDirectDatabaseUrl } from '$lib/server/database-url';

import { SeedActivity, type SeedActivityType } from './seed-activity';

async function SeedActivities(prisma: PrismaClient) {
	console.log('🎉 Seeding activities...');

	const activities: SeedActivityType[] = [
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
			placeGangName: 'Los Bugas',
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/trucha.jpeg'
		},
		{
			name: 'Fiesta La Teja',
			date: new Date('2026-09-11T02:00:00.000Z'),
			placeGangName: 'ALOK2',
			dateDesc: 'Noche del jueves 10',
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/la-teja.jpeg'
		},
		{
			name: 'Pascual Race - Carrera de motos para niños de 0 a 4 años',
			date: new Date('2026-09-11T11:00:00.000Z'),
			notes: 'Confirmar asistencia a (+34 617 14 84 19)',
			placeDesc: 'Plaza Mayor',
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/pascual-race.jpeg'
		},
		{
			name: 'XX Aniversario Contentongo',
			date: new Date('2026-09-11T14:00:00.000Z'),
			dateDesc: '16:00 a 19:00',
			placeGangName: 'Contenta me tienes',
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/contentongo.jpeg'
		},
		{
			name: 'V Danza del Sapo',
			date: new Date('2026-09-12T03:00:00.000Z'),
			dateDesc: 'Noche del viernes 11, de 05:00 a 08:00',
			placeGangName: 'El Desmadre',
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/danza-del-sapo.jpeg'
		},
		{
			name: 'VII Babrera Circus Party con Chupitada',
			date: new Date('2026-09-12T13:30:00.000Z'),
			dateDesc: '15:30 a 18:00',
			placeGangName: 'La Babrera',
			collaboratingGangNames: ['KPY'],
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/circus-party.jpeg'
		},
		{
			name: 'XV Meterla en la viga',
			date: new Date('2026-09-12T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Badulake'
		},
		{
			name: 'III Fiesta del Corzo',
			date: new Date('2026-09-13T01:00:00.000Z'),
			dateDesc: 'De encierro a encierro',
			placeGangName: 'La movida'
		},
		{
			name: 'Concierto Flamenco Pop-Rock con Aarón Miguel',
			date: new Date('2026-09-13T13:30:00.000Z'),
			placeGangName: 'La Gres-k',
			collaboratingGangNames: ['Las druidas'],
			bannerPath:
				'https://aflgjnvgc42iwomt.public.blob.vercel-storage.com/actividades-2026/concierto-flamenco.jpeg'
		},
		{
			name: 'Viva el Vino Uve Palito',
			date: new Date('2026-09-13T18:00:00.000Z'),
			dateDesc: 'Después de los toros',
			placeGangName: 'Talanquera'
		},
		{
			name: 'Juego del Pañuelo',
			date: new Date('2026-09-13T23:30:00.000Z'),
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

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: requireDirectDatabaseUrl() })
});

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
