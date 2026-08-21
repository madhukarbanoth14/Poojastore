import { Role, UserStatus } from '@prisma/client';

export class AuthenticatedUser {
  id!: string;
  phoneE164!: string;
  role!: Role;
  status!: UserStatus;
  jti!: string;
}
