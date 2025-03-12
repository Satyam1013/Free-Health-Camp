import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type PatientDocument = Patient & Document

@Schema()
export class Patient {
  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  age: number

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true, default: UserRole.PATIENT })
  role: UserRole

  @Prop({ type: Date })
  bookingDate?: Date

  @Prop({ type: Date })
  nextVisitDate?: Date

  @Prop({ default: BookingStatus.Pending })
  status?: BookingStatus
}

export const PatientSchema = SchemaFactory.createForClass(Patient)
