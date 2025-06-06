import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
// hi
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided')
    }

    const token = authHeader.split(' ')[1]
    try {
      const decoded = this.jwtService.verify(token)
      request.user = decoded

      // ?? Ensure only admins can access this route
      if (decoded.role !== 'Admin') {
        throw new ForbiddenException('Access denied: Admins only')
      }

      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
