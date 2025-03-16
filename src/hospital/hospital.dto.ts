import { IsNotEmpty, IsString, IsMobilePhone, IsNumber, IsOptional } from 'class-validator'
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

  role: UserRole = UserRole.HOSPITAL_STAFF
}

export class CreateDoctorDto {
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

  role: UserRole = UserRole.HOSPITAL_DOCTOR
}

export class EditDoctorDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  address: string

  @IsOptional()
  @IsMobilePhone()
  mobile: number

  @IsOptional()
  @IsString()
  password: string
}

export class CreateAvailableServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsNumber()
  fee: number
}

export class UpdateAvailableServiceDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsNumber()
  fee?: number
}

export class EditStaffDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsMobilePhone()
  mobile?: string

  @IsOptional()
  @IsString()
  password?: string
}

export class UpdateHospitalTimeDto {
  @IsOptional()
  @IsString()
  startTime?: string

  @IsOptional()
  @IsString()
  endTime?: string
}
