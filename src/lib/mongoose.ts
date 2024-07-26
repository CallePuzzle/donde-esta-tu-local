import { getPlatformProxy } from "wrangler";
import mongoose from 'mongoose';
import { logger } from '$lib/server/logger';

// connect to the database
export async function GetConnectedMongoose(): Promise<typeof mongoose> {

	const { env } = await getPlatformProxy();
	const MONGO_URI = env.MONGO_URI as string;

	await mongoose.connect(MONGO_URI);
	mongoose.set('debug', (collectionName, method, query, doc) => {
		logger.debug({ query: query, doc: doc }, `${collectionName}.${method}`);
	});
	return mongoose;
}
