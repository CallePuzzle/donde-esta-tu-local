// Helper importado por seed-activities.ts (el script real, enganchado a
// `bun run db:seed-activities` en package.json). Este fichero no se ejecuta
// solo; es una dependencia, no un script huérfano (Q14).
import type { PrismaClient, Prisma } from '$lib/generated/prisma/client';

export type SeedActivityType = {
	name: string;
	date: Date;
	dateDesc?: string;
	placeDesc?: string;
	notes?: string;
	collaboratingGangNames?: string[];
	placeGangName?: string;
	bannerPath?: string;
};

async function findGangByName(prisma: PrismaClient, name: string) {
	const normalized = name.toLowerCase();

	return (
		(await prisma.gang.findFirst({ where: { name } })) ??
		(await prisma.gang.findFirst({
			where: {
				name: {
					mode: 'insensitive',
					equals: name
				}
			}
		})) ??
		(await prisma.gang.findFirst({ where: { normalizedName: normalized } }))
	);
}

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
		placeDesc: placeDescIn,
		notes: notesIn,
		bannerPath: bannerPathIn
	} = activity;
	const dateDesc = dateDescIn ?? null;
	const placeDesc = placeDescIn ?? null;
	const notes = notesIn ?? null;
	const bannerPath = bannerPathIn ?? null;

	const collaboratingGangs: CollaboratingGang[] = [];

	if (collaboratingGangNames) {
		for (let i = 0; i < collaboratingGangNames.length; i++) {
			const gangName = collaboratingGangNames[i];
			const gang = await findGangByName(prisma, gangName);
			if (!gang) {
				console.log('⚠️  No se encontró la peña ' + gangName);
				return;
			}
			collaboratingGangs.push({ id: gang.id });
		}
	}

	let update: Prisma.ActivityUpdateInput = {
		name,
		dateDesc,
		placeDesc,
		notes,
		bannerPath
	};

	let create: Prisma.ActivityCreateInput = {
		name,
		date,
		dateDesc,
		placeDesc,
		notes,
		bannerPath
	};

	if (placeGangName) {
		const placeGang = await findGangByName(prisma, placeGangName);
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
