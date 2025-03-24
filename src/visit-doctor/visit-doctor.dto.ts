import { PartialType } from '@nestjs/mapped-types'
import { IsString, IsNotEmpty, IsNumber, IsDate, IsEnum } from 'class-validator'
import { UserRole } from 'src/common/common.types'

export class CreateVisitDetailDto {
  @IsNotEmpty()
  @IsString()
  visitName: string

  @IsNotEmpty()
  @IsString()
  visitPlace: string

  @IsNotEmpty()
  @IsNumber()
  doctorFee: number

  @IsNotEmpty()
  @IsDate()
  eventDate: Date

  @IsNotEmpty()
  @IsDate()
  startTime: Date

  @IsNotEmpty()
  @IsDate()
  endTime: Date

  @IsString()
  @IsNotEmpty()
  city: string
}

export class UpdateVisitDetailDto extends PartialType(CreateVisitDetailDto) {}

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

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
