import sqlite3 from 'sqlite3';
import prisma from '../src/lib/server/db';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new sqlite3.Database(':memory:');

// Read and execute the database schema
const schema = readFileSync(join(__dirname, '../database.sql'), 'utf-8');
db.exec(schema, (err) => {
	if (err) {
		console.error('Error creating database schema:', err);
		process.exit(1);
	}
});

function getAllGangsFromDB(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		db.all("SELECT * FROM Gang where status != 'REFUSED'", (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
}

async function main() {
	// Create or find migration user
	const migrationUser = await prisma.user.upsert({
		where: { email: 'migration@system.local' },
		update: {},
		create: {
			id: 'migration-user',
			name: 'Migration User',
			email: 'migration@system.local',
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			role: 'system',
			membershipGangStatus: 'VALIDATED'
		}
	});
	console.log('✅ Created/found migration user');

	const gangs = await getAllGangsFromDB();
	console.log('✅ Fetched gangs from database');

	// Insert gangs with migration user as validator
	for (const gang of gangs) {
		console.log('Migrating gang: ' + gang.name);
		const gangData = {
			name: gang.name,
			latitude: gang.latitude,
			longitude: gang.longitude,
			status: gang.status
		};
		try {
			await prisma.gang.upsert({
				where: {
					id: gang.id
				},
				update: {
					...gangData,
					validatedByUserId: migrationUser.id
				},
				create: {
					...gangData,
					id: gang.id,
					validatedByUserId: migrationUser.id
				}
			});
		} catch (error) {
			console.error('Error migrating gang:', error);
		}
	}

	console.log(`✅ Created ${gangs.length} gangs`);
}

main()
	.catch((e) => {
		console.error('❌ Seed failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
