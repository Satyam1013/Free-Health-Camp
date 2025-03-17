import { SetMetadata } from '@nestjs/common'
import { UserRole } from './create-user.dto'

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)
