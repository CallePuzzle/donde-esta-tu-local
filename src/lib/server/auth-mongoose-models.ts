import { GetConnectedMongoose } from '$lib/mongoose';

const mongoose = await GetConnectedMongoose();

export const User = mongoose.model(
	'User',
	new mongoose.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			email: {
				type: String,
				required: true
			}
		} as const,
		{ _id: false }
	)
);

export const Session = mongoose.model(
	'Session',
	new mongoose.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			user_id: {
				type: String,
				required: true
			},
			expires_at: {
				type: Date,
				required: true
			}
		} as const,
		{ _id: false }
	)
);
