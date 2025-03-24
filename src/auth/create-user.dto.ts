import { IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator'
import { UserRole } from 'src/common/common.types'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username: string

  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  password: string

  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole

  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsNumber({}, { message: 'Mobile must be a number' })
  mobile: number

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string
}
