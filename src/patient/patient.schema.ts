import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type PatientDocument = Patient & Document

@Schema()
export class Patient {
  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  age: number

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender

  @Prop({ unique: true, required: true })
  email: string

  @Prop({ required: true, default: UserRole.PATIENT })
  role: UserRole

  @Prop({ type: Date })
  bookingDate?: Date

  @Prop({ type: Date })
  nextVisitDate?: Date

  @Prop({ default: BookingStatus.Pending })
  status?: BookingStatus

  @Prop({
    type: [
      {
        eventId: String,
        eventName: String,
        eventPlace: String,
        eventDate: Date,
        startTime: String,
        endTime: String,
      },
    ],
    default: [],
  })
  bookedEvents: Array<{
    eventId: string
    eventName: string
    eventPlace: string
    eventDate: Date
    startTime: string
    endTime: string
  }>

  @Prop({
    type: [{ labId: String, name: String, address: String, services: [String] }],
    default: [],
  })
  bookedLabs: Array<{
    labId: string
    name: string
    address: string
    services: string[]
  }>

  @Prop({
    type: [{ hospitalId: String, name: String, address: String, services: [String] }],
    default: [],
  })
  bookedHospitals: Array<{
    hospitalId: string
    name: string
    address: string
    services: string[]
  }>
}

export const PatientSchema = SchemaFactory.createForClass(Patient)
