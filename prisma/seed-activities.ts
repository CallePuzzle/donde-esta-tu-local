import { PrismaClient } from '@prisma/client';

export async function SeedActivities(prisma: PrismaClient) {
	console.log('🎉 Seeding activities...');

	// Buscar las peñas existentes por nombre
	const kpyGang = await prisma.gang.findFirst({
		where: {
			name: 'KPY'
		}
	});

	const babreraGang = await prisma.gang.findFirst({
		where: {
			name: 'La Babrera'
		}
	});

	if (!kpyGang) {
		console.log('⚠️  No se encontró la peña KPY');
		return;
	}

	if (!babreraGang) {
		console.log('⚠️  No se encontró la peña Babrera');
		return;
	}

	// Crear la fecha: 12 de septiembre a las 23:00
	const currentYear = new Date().getFullYear();
	const activityDate = new Date(currentYear, 8, 12, 23, 0, 0); // Mes 8 = septiembre (0-indexed)

	// Si la fecha ya pasó este año, usar el próximo año
	if (activityDate < new Date()) {
		activityDate.setFullYear(currentYear + 1);
	}

	// Crear la actividad
	const activity = await prisma.activity.create({
		data: {
			name: 'VI Babrera Circus Party con chupitada',
			desc: 'La sexta edición del legendario Circus Party de la peña Babrera. No te pierdas esta fiesta temática con chupitada incluida.',
			date: activityDate,
			organisingGangs: {
				connect: [{ id: kpyGang.id }, { id: babreraGang.id }]
			},
			placeGangId: babreraGang.id
		},
		include: {
			organisingGangs: true,
			placeGang: true
		}
	});

	console.log(`✅ Actividad creada: "${activity.name}"`);
	console.log(`   📅 Fecha: ${activity.date.toLocaleString('es-ES')}`);
	console.log(`   🏠 Lugar: ${activity.placeGang?.name}`);
	console.log(`   👥 Organizan: ${activity.organisingGangs.map((g) => g.name).join(', ')}`);
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
