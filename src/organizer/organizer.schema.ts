import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { BaseModel } from 'src/common/common.schema'
import { Doctor, DoctorSchema, Staff, StaffSchema } from '../common/common.schema'

@Schema()
export class OrganizerDoctor extends Doctor {
  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.ORGANIZER_DOCTOR })
  role: UserRole
}

@Schema()
export class OrganizerStaff extends Staff {
  @Prop({ required: true, default: UserRole.ORGANIZER_STAFF })
  role: UserRole
}

// Define Event Schema
@Schema()
class Event {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  eventName: string

  @Prop({ required: true })
  eventPlace: string

  @Prop({ required: true })
  eventDate: Date

  @Prop({ type: Date, required: true })
  startTime: Date

  @Prop({ type: Date, required: true })
  endTime: Date

  @Prop({ type: [DoctorSchema], default: [] })
  doctors: OrganizerDoctor[]

  @Prop({ type: [StaffSchema], default: [] })
  staff: OrganizerStaff[]
}

const EventSchema = SchemaFactory.createForClass(Event)

// Define Organizer Schema
@Schema()
export class Organizer extends BaseModel {
  @Prop({ required: true, default: UserRole.ORGANIZER })
  role: UserRole

  @Prop({ type: [EventSchema], default: [] })
  events: Event[]
}

export type OrganizerDocument = Organizer & Document
export const OrganizerSchema = SchemaFactory.createForClass(Organizer)
