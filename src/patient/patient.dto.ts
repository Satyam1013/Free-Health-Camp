import { IsEnum, IsNotEmpty, IsDate } from 'class-validator'
import { BookingStatus } from './patient.schema'

export class BookDoctorDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus

  @IsDate()
  @IsNotEmpty()
  bookingDate: Date
}
