import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from 'src/common/common.types'
import { BaseModel, Gender } from 'src/common/common.schema'
import { BookingStatus } from 'src/common/common.types'

@Schema()
export class BookedEvent {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true })
  serviceId: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true })
  providerId: Types.ObjectId

  @Prop()
  providerRole: UserRole

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

export type PatientDocument = Patient & Document

@Schema()
export class Patient extends BaseModel {
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
