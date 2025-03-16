import { IsNotEmpty, IsString, IsMobilePhone } from 'class-validator'
import { UserRole } from 'src/auth/create-user.dto'

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  address: string

  @IsNotEmpty()
  @IsMobilePhone()
  mobile: number

  @IsNotEmpty()
  @IsString()
  password: string

  role: UserRole = UserRole.LAB_STAFF
}
