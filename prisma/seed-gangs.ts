import type { PrismaClient } from '@prisma/client';
export async function SeedGangs(prisma: PrismaClient) {
	// Clear existing gangs
	await prisma.gang.deleteMany();
	console.log('✅ Cleared existing gangs');

	// Gang data
	const gangs = [
		{
			id: 4,
			name: 'KPY',
			latitude: 41.50787831456103,
			longitude: -4.46148416401229,
			status: 'VALIDATED'
		},
		{
			id: 5,
			name: 'ALOK2',
			latitude: 41.50992742435137,
			longitude: -4.455106258392335,
			status: 'VALIDATED'
		},
		{
			id: 7,
			name: 'EL CLAVO',
			latitude: 41.50946244245538,
			longitude: -4.459784030914308,
			status: 'VALIDATED'
		},
		{
			id: 8,
			name: 'La Peña',
			latitude: 41.50911801568895,
			longitude: -4.459996814121042,
			status: 'VALIDATED'
		},
		{
			id: 9,
			name: 'Tembleke y Amareyu',
			latitude: 41.50884591217311,
			longitude: -4.460570132450812,
			status: 'VALIDATED'
		},
		{
			id: 11,
			name: 'Sawatakis',
			latitude: 41.50797455005522,
			longitude: -4.453706145286561,
			status: 'VALIDATED'
		},
		{
			id: 12,
			name: 'La Tribu',
			latitude: 41.51012389303492,
			longitude: -4.459408521652223,
			status: 'VALIDATED'
		},
		{
			id: 13,
			name: 'Las Nomadas',
			latitude: 41.50962554725057,
			longitude: -4.458614587783814,
			status: 'VALIDATED'
		},
		{
			id: 14,
			name: 'La movida',
			latitude: 41.50774576008232,
			longitude: -4.459757208824159,
			status: 'VALIDATED'
		},
		{
			id: 15,
			name: 'Las druidas',
			latitude: 41.50841533912319,
			longitude: -4.455306007944274,
			status: 'VALIDATED'
		},
		{
			id: 16,
			name: 'Skpa-2',
			latitude: 41.51018482094923,
			longitude: -4.45850751901872,
			status: 'VALIDATED'
		},
		{
			id: 17,
			name: 'Talanquera',
			latitude: 41.50881114002722,
			longitude: -4.455020651021322,
			status: 'VALIDATED'
		},
		{
			id: 20,
			name: 'Kalikeños',
			latitude: 41.50887549189768,
			longitude: -4.451887607574464,
			status: 'VALIDATED'
		},
		{
			id: 21,
			name: 'Urukay',
			latitude: 41.50887505512292,
			longitude: -4.460889101028443,
			status: 'VALIDATED'
		},
		{
			id: 22,
			name: 'El Chamizo',
			latitude: 41.51079567654251,
			longitude: -4.461575746536256,
			status: 'VALIDATED'
		},
		{
			id: 23,
			name: 'La Tregua',
			latitude: 41.50930380948274,
			longitude: -4.458351970746298,
			status: 'VALIDATED'
		},
		{
			id: 24,
			name: 'Las chicas',
			latitude: 41.50797427692041,
			longitude: -4.457756280899049,
			status: 'VALIDATED'
		},
		{
			id: 25,
			name: 'Los Bugas',
			latitude: 41.51132469940838,
			longitude: -4.458534121513368,
			status: 'VALIDATED'
		},
		{
			id: 26,
			name: 'El K-OS',
			latitude: 41.51071440160644,
			longitude: -4.461168050765992,
			status: 'VALIDATED'
		},
		{
			id: 28,
			name: 'La Unión',
			latitude: 41.50758152474093,
			longitude: -4.454703927040101,
			status: 'VALIDATED'
		},
		{
			id: 29,
			name: 'El Desmadre',
			latitude: 41.50870875360579,
			longitude: -4.459301233291627,
			status: 'REFUSED'
		},
		{
			id: 30,
			name: 'Oasis',
			latitude: 41.51016007067275,
			longitude: -4.458925724029542,
			status: 'VALIDATED'
		},
		{
			id: 31,
			name: '13 la víspera',
			latitude: 41.50857654551956,
			longitude: -4.457836977930866,
			status: 'VALIDATED'
		},
		{
			id: 32,
			name: 'La Farándula',
			latitude: 41.5097020979003,
			longitude: -4.459033012390138,
			status: 'VALIDATED'
		},
		{
			id: 33,
			name: 'La Gres-k',
			latitude: 41.50804646826436,
			longitude: -4.456275060023614,
			status: 'VALIDATED'
		},
		{
			id: 34,
			name: 'La Babrera',
			latitude: 41.50926021433555,
			longitude: -4.453336000442506,
			status: 'VALIDATED'
		},
		{
			id: 36,
			name: 'La Fusión',
			latitude: 41.50749666716214,
			longitude: -4.459161758422852,
			status: 'VALIDATED'
		},
		{
			id: 37,
			name: 'Badulake',
			latitude: 41.50862767814304,
			longitude: -4.456400033141109,
			status: 'VALIDATED'
		},
		{
			id: 38,
			name: 'Lo que faltaba',
			latitude: 41.51035688345478,
			longitude: -4.456801414489747,
			status: 'VALIDATED'
		},
		{
			id: 40,
			name: 'Los Nicks',
			latitude: 41.50917314027112,
			longitude: -4.458287358283997,
			status: 'VALIDATED'
		},
		{
			id: 42,
			name: 'Peña 1521',
			latitude: 41.50881920912516,
			longitude: -4.451394081115724,
			status: 'VALIDATED'
		},
		{
			id: 43,
			name: 'El K-os',
			latitude: 41.50991425230015,
			longitude: -4.456822872161866,
			status: 'VALIDATED'
		},
		{
			id: 44,
			name: 'El Desmadre',
			latitude: 41.50871300068093,
			longitude: -4.459374436855796,
			status: 'VALIDATED'
		},
		{
			id: 45,
			name: 'CachiBaches',
			latitude: 41.50921036758067,
			longitude: -4.456410822058388,
			status: 'VALIDATED'
		},
		{
			id: 46,
			name: 'Psicodélico',
			latitude: 41.50998329496207,
			longitude: -4.4584858417511,
			status: 'VALIDATED'
		},
		{
			id: 47,
			name: 'Andeandara',
			latitude: 41.51003150018472,
			longitude: -4.459226131524241,
			status: 'VALIDATED'
		},
		{
			id: 48,
			name: 'El K-pote',
			latitude: 41.50942959464227,
			longitude: -4.46021318435669,
			status: 'VALIDATED'
		},
		{
			id: 49,
			name: 'El burladero',
			latitude: 41.50944793195666,
			longitude: -4.453883171081544,
			status: 'VALIDATED'
		},
		{
			id: 50,
			name: 'Contenta me tienes',
			latitude: 41.50789176094931,
			longitude: -4.459022908293657,
			status: 'VALIDATED'
		},
		{
			id: 51,
			name: 'PIRATAS',
			latitude: 41.51001459782578,
			longitude: -4.457714182899342,
			status: 'VALIDATED'
		},
		{
			id: 52,
			name: 'Los indecisos',
			latitude: 41.50955811081169,
			longitude: -4.458759888361464,
			status: 'VALIDATED'
		},
		{
			id: 53,
			name: 'La Charrancha',
			latitude: 41.50976176470978,
			longitude: -4.458111855321954,
			status: 'VALIDATED'
		},
		{
			id: 54,
			name: 'La Anaskardia',
			latitude: 41.50804099542041,
			longitude: -4.45850937759811,
			status: 'VALIDATED'
		},
		{
			id: 55,
			name: 'AZTECAS',
			latitude: 41.50833003489456,
			longitude: -4.461253881454469,
			status: 'VALIDATED'
		},
		{
			id: 56,
			name: 'El monton',
			latitude: 41.50717054058363,
			longitude: -4.462925220322252,
			status: 'VALIDATED'
		},
		{
			id: 57,
			name: 'La Viga',
			latitude: 41.50987113813033,
			longitude: -4.460610151290894,
			status: 'PENDING'
		},
		{
			id: 58,
			name: 'KasKau',
			latitude: 41.50969687769008,
			longitude: -4.461474493145944,
			status: 'VALIDATED'
		},
		{
			id: 59,
			name: 'Los Rebeldes',
			latitude: 41.50824980695401,
			longitude: -4.460012018680573,
			status: 'VALIDATED'
		},
		{
			id: 60,
			name: 'El corralito',
			latitude: 41.50886368328586,
			longitude: -4.454266391694547,
			status: 'PENDING'
		},
		{
			id: 61,
			name: 'Los de siempre',
			latitude: 41.51013232393657,
			longitude: -4.455519318580628,
			status: 'PENDING'
		}
	];

	// Insert gangs
	for (const gang of gangs) {
		await prisma.gang.create({
			data: gang
		});
	}

	console.log(`✅ Created ${gangs.length} gangs`);
}
