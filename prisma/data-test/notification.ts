import { getPrismaClient } from '../../src/lib/tests/clientForTest';

const prisma = await getPrismaClient();

async function main() {
	console.log(`Start seeding ...`);

	for (let i = 0; i < 10; i++) {
		await prisma.notification.create({
			data: {
				title: `Nueva peña ${i}`,
				body: `Se ha añadido una nueva peña: ${i}`,
				type: 'gang-added',
				status: 'PENDING',
				addedByUserId: 'admin|local',
				relatedGangId: 1,
				users: {
					connect: {
						id: 'email|66d5a248d30432de7bf76e64'
					}
				}
			}
		});
	}
	for (let i = 0; i < 10; i++) {
		await prisma.notification.create({
			data: {
				title: `Nueva solicitud de miembro ${i}`,
				body: `Pepe quiere unirse a una peña ${i}`,
				type: 'gang-member-request',
				status: 'PENDING',
				addedByUserId: 'admin|local',
				relatedGangId: 1,
				users: {
					connect: {
						id: 'email|66d5a248d30432de7bf76e64'
					}
				}
			}
		});
	}

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
