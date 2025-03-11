import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

export type PatientDocument = Patient & Document

@Schema()
export class Patient extends BaseModel {
  @Prop()
  age: number

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
