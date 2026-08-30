import type { Gang } from '$lib/generated/prisma/client';
// El usuario puede no tener peña asignada, de ahí que id sea nullable
// (a diferencia de Gang.id, que en la base de datos nunca lo es).
export type UserGangDetail = Pick<Gang, 'name'> & { id: Gang['id'] | null };
