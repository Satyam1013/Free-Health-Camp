import { IsEnum, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator'

export enum UserRole {
  ORGANIZER = 'Organizer',
  HOSPITAL = 'Hospital',
  LAB = 'Lab',
  VISIT_DOCTOR = 'VisitDoctor',
  PATIENT = 'Patient',

  // ✅ Sub-Roles
  ORGANIZER_DOCTOR = 'OrganizerDoctor',
  ORGANIZER_STAFF = 'OrganizerStaff',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string

  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole

  @IsInt({ message: 'Mobile number must be a valid integer' })
  @IsNotEmpty()
  mobile: number

  @IsString()
  address: string

  @IsString()
  city: string
}
