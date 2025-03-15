import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { Gender } from 'src/common/common.schema'

export enum BookingStatus {
  Booked = 'Booked',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
}

export type PatientDocument = Patient & Document

@Schema()
export class BookedEvent {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true })
  serviceId: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true })
  providerId: Types.ObjectId

  @Prop({ required: true })
  serviceName: string

  @Prop({ default: BookingStatus.Pending })
  status: BookingStatus

  @Prop({ type: Date })
  bookingDate: Date

  @Prop({ type: Date })
  nextVisitDate?: Date
}

export const BookedEventSchema = SchemaFactory.createForClass(BookedEvent)

@Schema()
export class Patient {
  @Prop({ required: true, unique: true })
  email: string

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

  @Prop({ required: true, default: UserRole.PATIENT })
  role: UserRole

  @Prop({ type: [BookedEventSchema], default: [] })
  bookEvents?: BookedEvent[]
}

export const PatientSchema = SchemaFactory.createForClass(Patient)
