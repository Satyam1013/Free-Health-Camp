import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() userDto: any) {
    return this.authService.signup(userDto)
  }

  @Post('login')
  async login(@Body() userDto: any) {
    return this.authService.login(userDto)
  }
}
