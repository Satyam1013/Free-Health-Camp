import { IsInt, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsInt({ message: 'Mobile number must be a valid integer' })
  mobile: number

  @IsString()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string
}

export class AdminLoginDto {
  @IsString()
  email: string

  @IsString()
  password: string
}
