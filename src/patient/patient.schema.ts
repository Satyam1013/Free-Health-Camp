import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type PatientDocument = Patient & Document

@Schema()
export class Patient {
  @Prop({ required: true })
  username: string

  @Prop()
  age: number

  @Prop()
  address: string

  @Prop({ required: true })
  role: 'Patient'

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String, required: true })
  city: string

  @Prop({
    type: [
      {
        eventId: String,
        eventName: String,
        eventPlace: String,
        eventDate: String,
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
    eventDate: string
    startTime: string
    endTime: string
  }>

  @Prop({
    type: [{ doctorId: String, name: String, address: String, mobile: String }],
    default: [],
  })
  bookedDoctors: Array<{
    doctorId: string
    name: string
    address: string
    mobile: string
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
