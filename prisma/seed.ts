import { getPrismaClient } from '../src/lib/tests/clientForTest';

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
			role: 'ADMIN'
		}
	});

	// Create USER user member of gang 1
	await prisma.user.create({
		data: {
			id: 'user|local',
			name: 'User Local',
			gangId: gang1.id
		}
	});

	// Create USER without gang
	await prisma.user.create({
		data: {
			id: 'user|no-gang',
			name: 'User No Gang'
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
