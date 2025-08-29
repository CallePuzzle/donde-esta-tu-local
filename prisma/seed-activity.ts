import type { PrismaClient, Prisma } from '@prisma/client';

export type SeedActivityType = {
	name: string;
	date: Date;
	dateDesc?: string;
	placeDesc?: string;
	collaboratingGangNames?: string[];
	placeGangName?: string;
};

export async function SeedActivity(prisma: PrismaClient, activity: SeedActivityType) {
	type CollaboratingGang = {
		id: number;
	};

	const {
		name,
		date,
		dateDesc: dateDescIn,
		collaboratingGangNames,
		placeGangName,
		placeDesc: placeDescIn
	} = activity;
	const dateDesc = dateDescIn ?? null;
	const placeDesc = placeDescIn ?? null;

	const collaboratingGangs: CollaboratingGang[] = [];

	if (collaboratingGangNames) {
		for (let i = 0; i < collaboratingGangNames.length; i++) {
			const gang = await prisma.gang.findFirst({
				where: {
					name: collaboratingGangNames[i]
				}
			});
			if (!gang) {
				console.log('⚠️  No se encontró la peña ' + collaboratingGangNames[i]);
				return;
			}
			collaboratingGangs.push({ id: gang.id });
		}
	}

	let update: Prisma.ActivityUpdateInput = {
		name,
		dateDesc,
		placeDesc
	};

	let create: Prisma.ActivityCreateInput = {
		name,
		date,
		dateDesc,
		placeDesc
	};

	if (placeGangName) {
		const placeGang = await prisma.gang.findFirst({
			where: {
				name: placeGangName
			}
		});
		if (!placeGang) {
			console.log('⚠️  No se encontró la peña ' + placeGangName);
			return;
		}

		update = { ...update, placeGang: { connect: { id: placeGang.id } } };

		create = { ...create, placeGang: { connect: { id: placeGang.id } } };
	}

	if (collaboratingGangs.length > 0) {
		update = { ...update, collaboratingGangs: { connect: collaboratingGangs } };
		create = { ...create, collaboratingGangs: { connect: collaboratingGangs } };
	}

	const activitySeeded = await prisma.activity.upsert({
		where: {
			date
		},
		update,
		create
	});

	console.log('✅  Actividad creada: ' + activitySeeded.name);
}
