import { getPrismaClient } from './clientForTest';

const prisma = await getPrismaClient();

async function main() {
	console.log(`Start seeding ...`);

	// Create gang 41.50855419665639, -4.46047229590312
	const gang1 = await prisma.gang.create({
		data: {
			name: 'Gang 1',
			latitude: 41.50855419665639,
			longitude: -4.46047229590312
		}
	});

	// Create gang VALIDATED 41.5097485035854, -4.46097533260006
	await prisma.gang.create({
		data: {
			name: 'Gang 2',
			latitude: 41.5097485035854,
			longitude: -4.46097533260006,
			status: 'VALIDATED'
		}
	});

	// Create ADMIN user
	await prisma.user.create({
		data: {
			id: 'admin|local',
			name: 'Admin Local',
			email: 'admin@localhost.es',
			role: 'ADMIN'
		}
	});

	// Create USER user member of gang 1
	await prisma.user.create({
		data: {
			id: 'user|local',
			name: 'User Local',
			email: 'user@localhost.es',
			gangId: gang1.id
		}
	});

	console.log(`Seeding finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
