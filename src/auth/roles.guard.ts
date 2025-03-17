import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!requiredRoles) {
      return true // If no roles are specified, allow access
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const userRole = request.user.role

    return requiredRoles.includes(userRole)
  }
}
