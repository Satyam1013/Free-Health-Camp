import { IsInt, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsInt({ message: 'Mobile number must be a valid integer' })
  mobile: number

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string
}
