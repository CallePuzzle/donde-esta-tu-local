import type { Gang, User } from '@prisma/client';

type GangData = Pick<Gang, 'id' | 'name' | 'latitude' | 'longitude' | 'status'>;
// El nombre visible ya viene resuelto del servidor (memberDisplayName, con
// fallback a email si name está vacío); el email en sí no se serializa.
type Member = Pick<User, 'id' | 'image'> & { displayName: string };
type CurrentGang = Pick<Gang, 'id' | 'name'>;

export type { GangData, Member, CurrentGang };
