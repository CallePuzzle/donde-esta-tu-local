import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { DATABASE_URL } from '$env/static/private';

const adapter = new PrismaPg({ DATABASE_URL });
const db = new PrismaClient({ adapter });

export default db;
