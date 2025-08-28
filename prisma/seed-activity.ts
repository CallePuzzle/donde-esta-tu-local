import type { PrismaClient, Prisma } from '@prisma/client';

export type SeedActivityType = {
	name: string;
	date: Date;
	dateDesc?: string;
	desc?: string;
	organisingGangNames?: string[];
	placeGangName?: string;
};

export async function SeedActivity(prisma: PrismaClient, activity: SeedActivityType) {
	type OrganisingGang = {
		id: number;
	};

	const { name, date, desc: descInput, organisingGangNames, placeGangName } = activity;
	const desc = descInput ?? null;

	const organisingGangs: OrganisingGang[] = [];

	if (organisingGangNames) {
		for (let i = 0; i < organisingGangNames.length; i++) {
			const gang = await prisma.gang.findFirst({
				where: {
					name: organisingGangNames[i]
				}
			});
			if (!gang) {
				console.log('⚠️  No se encontró la peña ' + organisingGangNames[i]);
				return;
			}
			organisingGangs.push({ id: gang.id });
		}
	}

	let update: Prisma.ActivityUpdateInput;
	let create: Prisma.ActivityCreateInput;

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
		update = {
			name,
			desc,
			organisingGangs: {
				connect: organisingGangs
			},
			placeGang: { connect: { id: placeGang.id } }
		};

		create = {
			name,
			date,
			desc,
			organisingGangs: {
				connect: organisingGangs
			},
			placeGang: { connect: { id: placeGang.id } }
		};
	} else {
		update = {
			name,
			desc,
			organisingGangs: {
				connect: organisingGangs
			}
		};

		create = {
			name,
			date,
			desc,
			organisingGangs: {
				connect: organisingGangs
			}
		};
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
