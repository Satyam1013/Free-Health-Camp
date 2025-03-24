import { IsEnum, IsNotEmpty, IsDate } from 'class-validator'
import { BookingStatus } from 'src/common/common.types'

export class BookDoctorDto {
  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus

  @IsDate()
  @IsNotEmpty()
  bookingDate: Date
}
