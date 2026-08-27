import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_PREFIX = '[TEST NOTIF]';

function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60 * 1000);
}

async function main() {
	console.log('🧹 Limpiando actividades de test anteriores...');

	await prisma.activityNotificationLog.deleteMany({
		where: {
			activity: {
				name: { startsWith: TEST_PREFIX }
			}
		}
	});

	const deleted = await prisma.activity.deleteMany({
		where: {
			name: { startsWith: TEST_PREFIX }
		}
	});
	console.log(`🗑️  ${deleted.count} actividad(es) de test borrada(s).`);

	const now = new Date();

	const activities = [
		{
			name: `${TEST_PREFIX} Actividad en 5 minutos`,
			date: addMinutes(now, 5),
			placeDesc: 'Plaza de prueba'
		},
		{
			name: `${TEST_PREFIX} Actividad en 30 minutos`,
			date: addMinutes(now, 30),
			placeDesc: 'Calle de prueba'
		},
		{
			name: `${TEST_PREFIX} Actividad fuera de ventana (90 min)`,
			date: addMinutes(now, 90),
			placeDesc: 'Lugar lejano'
		},
		{
			name: `${TEST_PREFIX} Actividad pasada`,
			date: addMinutes(now, -10),
			placeDesc: 'Lugar pasado'
		}
	];

	for (const activity of activities) {
		const created = await prisma.activity.create({ data: activity });
		console.log(`✅  Creada: ${created.name} a las ${created.date.toISOString()}`);
	}

	console.log('🌱 Seed completado.');
	console.log('Ejecuta el cron para probar notificaciones:');
	console.log(
		`curl -X POST http://localhost:4174/api/notifications/send -H "Authorization: Bearer <CRON_SECRET>"`
	);
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
