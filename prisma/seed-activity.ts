import type { Activity, PrismaClient } from '@prisma/client';

export type SeedActivityType = {
	name: string;
	date: Date;
	desc?: string;
	organisingGangNames: string[];
	placeGangName?: string;
};

export async function SeedActivity(prisma: PrismaClient, activity: SeedActivityType) {
	type OrganisingGang = {
		id: number;
	};

	const { name, date, desc, organisingGangNames, placeGangName } = activity;

	const organisingGangs: OrganisingGang[] = [];

	if (organisingGangNames) {
		for (let i = 0; i < organisingGangNames.length; i++) {
			const gang = await prisma.gang.findUnique({
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

	let activitySeeded: Activity;

	if (placeGangName) {
		const placeGang = await prisma.gang.findUnique({
			where: {
				name: placeGangName
			}
		});
		if (!placeGang) {
			console.log('⚠️  No se encontró la peña ' + placeGangName);
			return;
		}

		activitySeeded = await prisma.activity.create({
			data: {
				name,
				date,
				desc,
				organisingGangs: {
					connect: organisingGangs
				},
				placeGang: { connect: { id: placeGang.id } }
			}
		});
	} else {
		activitySeeded = await prisma.activity.create({
			data: {
				name,
				date,
				desc,
				organisingGangs: {
					connect: organisingGangs
				}
			}
		});
	}

	console.log('✅  Actividad creada: ' + activitySeeded.name);
}
