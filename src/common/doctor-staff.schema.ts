import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'
import { Gender } from './common.schema'

export enum BookingStatus {
  Booked = 'Booked',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
}

// Define Doctor Schema
@Schema()
export class Doctor {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.ORGANIZER_DOCTOR })
  role: UserRole

  @Prop({
    type: [
      {
        _id: Types.ObjectId,
        name: String,
        email: String,
        mobile: Number,
        gender: String,
        age: Number,
        bookingDate: Date,
        status: String,
      },
    ],
  })
  patients: Array<{
    _id: Types.ObjectId
    name: string
    email: string
    mobile: number
    age: number
    gender: Gender
    bookingDate: Date
    status: BookingStatus
  }>
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)

// Define Staff Schema
@Schema()
export class Staff {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ required: true, default: UserRole.ORGANIZER_STAFF })
  role: UserRole
}

export const StaffSchema = SchemaFactory.createForClass(Staff)
