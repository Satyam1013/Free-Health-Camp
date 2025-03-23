import { PartialType } from '@nestjs/mapped-types'
import { IsString, IsNotEmpty, IsDate, IsNumber, IsEnum } from 'class-validator'
import { UserRole } from 'src/auth/create-user.dto'

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  eventName: string

  @IsString()
  @IsNotEmpty()
  eventPlace: string

  @IsDate()
  @IsNotEmpty()
  eventDate: Date

  @IsDate()
  @IsNotEmpty()
  startTime: Date

  @IsDate()
  @IsNotEmpty()
  endTime: Date

  @IsString()
  @IsNotEmpty()
  city: string
}

export class EditEventDto extends PartialType(CreateEventDto) {}

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsNumber()
  @IsNotEmpty()
  mobile: number

  @IsString()
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole
}

export class EditDoctorDto extends PartialType(CreateDoctorDto) {}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsNumber()
  @IsNotEmpty()
  mobile: number

  @IsString()
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole
}

export class EditStaffDto extends PartialType(CreateStaffDto) {}
