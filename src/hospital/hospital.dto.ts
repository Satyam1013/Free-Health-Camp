import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsMongoId } from 'class-validator'
import { UserRole } from 'src/common/common.types'

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
  @IsMongoId()
  serviceId: string

  @IsNotEmpty()
  @IsString()
  service: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole
}

export class EditDoctorDto extends PartialType(CreateDoctorDto) {}

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

export class EditStaffDto extends PartialType(CreateStaffDto) {}

export class CreateAvailableServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsNumber()
  fee: number
}

export class UpdateAvailableServiceDto extends PartialType(CreateAvailableServiceDto) {}

export class UpdateHospitalTimeDto {
  @IsOptional()
  @IsString()
  shiftOneStartTime?: string

  @IsOptional()
  @IsString()
  shiftOneEndTime?: string

  @IsOptional()
  @IsString()
  shiftTwoStartTime?: string

  @IsOptional()
  @IsString()
  shiftTwoEndTime?: string
}
