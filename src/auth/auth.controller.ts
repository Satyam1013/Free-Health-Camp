import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from './create-user.dto'
import { AdminLoginDto, LoginDto } from './login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ transform: true }))
  async signup(@Body() signupDto: CreateUserDto) {
    return this.authService.signup(signupDto)
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('admin-login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto)
  }
}
