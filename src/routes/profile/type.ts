import type { Gang } from '@prisma/client';
export type UserGangDetail = Pick<Gang, 'id' | 'name'>;
