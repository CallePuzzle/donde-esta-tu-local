import type { Gang, User } from '@prisma/client';

type GangData = Pick<Gang, 'id' | 'name' | 'latitude' | 'longitude' | 'status'>;
type Member = Pick<User, 'id' | 'email' | 'name' | 'image' | 'membershipGangStatus'>;

export type { GangData, Member };
