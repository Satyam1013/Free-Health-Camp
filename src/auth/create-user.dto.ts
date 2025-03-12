import { IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator'

export enum UserRole {
  ORGANIZER = 'Organizer',
  HOSPITAL = 'Hospital',
  LAB = 'Lab',
  VISIT_DOCTOR = 'VisitDoctor',
  PATIENT = 'Patient',

  // ✅ Sub-Roles
  ORGANIZER_DOCTOR = 'OrganizerDoctor',
  ORGANIZER_STAFF = 'OrganizerStaff',
  VISIT_DOCTOR_STAFF = 'VisitDoctorStaff',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string

  @IsString()
  @IsNotEmpty()
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
}
