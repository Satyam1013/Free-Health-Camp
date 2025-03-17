import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
    })
  }

  async validate(payload: { sub: string; username: string; role: string }) {
    console.log('JwtStrategy - Payload:', payload)
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token')
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    }
  }
}
