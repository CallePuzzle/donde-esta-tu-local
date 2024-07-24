import { MONGO_URI } from '$env/static/private';
import mongoose from "mongoose";

// connect to the database
export async function connect(): Promise<void> {
	await mongoose.connect(MONGO_URI);
}