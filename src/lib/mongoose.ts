import { MONGO_URI } from '$env/static/private';
import mongoose from 'mongoose';
import { logger } from '$lib/server/logger';

// connect to the database
export async function GetConnectedMongoose(): Promise<typeof mongoose> {
	await mongoose.connect(MONGO_URI);
	mongoose.set('debug', (collectionName, method, query, doc) => {
		logger.debug({ query: query, doc: doc }, `${collectionName}.${method}`);
	});
	return mongoose;
}
