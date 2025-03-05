import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type OrganizerDocument = Organizer & Document

@Schema()
export class Organizer {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  city: string

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true, default: 'Organizer' })
  role: 'Organizer'

  @Prop({ required: true })
  password: string

  @Prop({
    type: [{ name: String, address: String, mobile: Number, pass: String }],
    default: [],
  })
  doctors: Array<{ name: string; address: string; mobile: number; pass: string }>

  @Prop({
    type: [{ name: String, address: String, mobile: Number, pass: String }],
    default: [],
  })
  staff: Array<{ name: string; address: string; mobile: number; pass: string }>

  @Prop({
    type: [{ eventName: String, eventPlace: String, eventDate: Date, startTime: String, endTime: String }],
    default: [],
  })
  events: Array<{
    eventName: string
    eventPlace: string
    eventDate: Date
    startTime: string
    endTime: string
  }>
}

export const OrganizerSchema = SchemaFactory.createForClass(Organizer)
