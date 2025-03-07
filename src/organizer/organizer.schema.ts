import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Doctor, DoctorSchema, Staff, StaffSchema } from 'src/common/doctor-staff.schema'

// Define Event Schema
@Schema()
class Event {
  @Prop({ required: true })
  eventName: string

  @Prop({ required: true })
  eventPlace: string

  @Prop({ required: true })
  eventDate: Date

  @Prop({ required: true })
  startTime: string

  @Prop({ required: true })
  endTime: string
}

const EventSchema = SchemaFactory.createForClass(Event)

// Define Organizer Schema
@Schema()
export class Organizer {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true, default: 'Organizer' })
  role: string

  @Prop({ required: true })
  password: string

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: Doctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: Staff[]

  @Prop({ type: [EventSchema], default: [] })
  events: Event[]
}

export type OrganizerDocument = Organizer & Document
export const OrganizerSchema = SchemaFactory.createForClass(Organizer)
