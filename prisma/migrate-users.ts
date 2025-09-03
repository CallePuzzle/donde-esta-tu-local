import { ManagementClient } from 'auth0';
import sqlite3 from 'sqlite3';
import { auth } from '../src/lib/server/auth-minimal';
import prisma from '../src/lib/server/db';

const auth0Client = new ManagementClient({
	domain: process.env.AUTH0_DOMAIN!,
	clientId: process.env.AUTH0_CLIENT_ID!,
	clientSecret: process.env.AUTH0_SECRET!
});

const db = new sqlite3.Database(':memory:');
import { readFileSync } from 'fs';
import { join } from 'path';

// Read and execute the database schema
const schema = readFileSync(join(__dirname, '../database.sql'), 'utf-8');
db.exec(schema, (err) => {
	if (err) {
		console.error('Error creating database schema:', err);
		process.exit(1);
	}
});

// Function to get all users from the database
function getAllUsersFromDB(): Promise<any[]> {
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM User', (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
}

function safeDateConversion(timestamp?: string | number): Date {
	if (!timestamp) return new Date();

	const numericTimestamp = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp;

	const milliseconds =
		numericTimestamp < 1000000000000 ? numericTimestamp * 1000 : numericTimestamp;

	const date = new Date(milliseconds);

	if (isNaN(date.getTime())) {
		console.warn(`Invalid timestamp: ${timestamp}, falling back to current date`);
		return new Date();
	}

	// Check for unreasonable dates (before 2000 or after 2100)
	const year = date.getFullYear();
	if (year < 2000 || year > 2100) {
		console.warn(`Suspicious date year: ${year}, falling back to current date`);
		return new Date();
	}

	return date;
}

async function main() {
	try {
		const ctx = await auth.$context;

		const perPage = 100;
		const auth0Users: any[] = [];
		let pageNumber = 0;

		while (true) {
			try {
				const params = {
					per_page: perPage,
					page: pageNumber,
					include_totals: true
				};
				const response = (await auth0Client.users.getAll(params)).data as any;
				const users = response.users || [];
				if (users.length === 0) break;
				auth0Users.push(...users);
				pageNumber++;

				if (users.length < perPage) break;
			} catch (error) {
				console.error('Error fetching users:', error);
				break;
			}
		}

		const dbUsers = await getAllUsersFromDB();
		for (const dbUser of dbUsers) {
			// Find the corresponding Auth0 user by matching dbUser.id with auth0User.user_id
			const auth0User = auth0Users.find((user) => user.user_id === dbUser.id);

			const migratedUser = await prisma.user.findUnique({
				where: {
					email: auth0User.email
				}
			});

			if (migratedUser) {
				console.log('User migrated: ' + migratedUser.email);
				continue;
			}

			if (auth0User) {
				const baseUserData = {
					id: auth0User.user_id,
					email: auth0User.email,
					emailVerified: auth0User.email_verified || false,
					name: auth0User.name || auth0User.nickname,
					image: auth0User.picture,
					createdAt: safeDateConversion(auth0User.created_at),
					updatedAt: safeDateConversion(auth0User.updated_at)
				};

				console.log('Migrating user', baseUserData);

				const createdUser = await ctx.adapter.create({
					model: 'user',
					data: {
						...baseUserData
					},
					forceAllowId: true
				});

				if (!createdUser?.id) {
					throw new Error('Failed to create user');
				}

				let data = { membershipGangStatus: 'VALIDATED' };

				if (dbUser.gangId) {
					data = {
						...data,
						gang: {
							connect: { id: dbUser.gangId }
						}
					};
				}

				console.log('Updating user data', data);

				const user = await prisma.user.update({
					where: { id: createdUser.id },
					data
				});

				console.log('Created user', user);
			} else {
				console.warn(`No Auth0 user found for database user with id: ${dbUser.id}`);
			}
		}

		console.log(`Found ${auth0Users.length} users to migrate`);
	} catch (error) {
		console.error('Migration failed:', error);
		throw error;
	}
}

main()
	.then(() => {
		console.log('Migration completed');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Migration failed:', error);
		process.exit(1);
	});
