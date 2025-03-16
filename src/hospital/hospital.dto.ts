import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator'
import { UserRole } from 'src/auth/create-user.dto'

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  address: string

  @IsNotEmpty()
  @IsNumber()
  mobile: number

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole
}

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  address: string

  @IsNotEmpty()
  @IsNumber()
  mobile: number

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole
}

export class EditDoctorDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  address: string

  @IsOptional()
  @IsNumber()
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
  @IsNumber()
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
