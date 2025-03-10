import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UserRole } from 'src/auth/create-user.dto'

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

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.ORGANIZER_DOCTOR })
  role: UserRole

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        name: { type: String, required: true },
        mobile: { type: Number, required: true },
        address: { type: String, required: true },
        bookingDate: { type: Date, default: Date.now },
        nextVisitDate: { type: Date, required: false },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.Pending },
      },
    ],
  })
  patients: Array<{
    _id: Types.ObjectId
    name: string
    mobile: number
    address: string
    bookingDate: Date
    nextVisitDate?: Date
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

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ required: true, enum: Object.values(UserRole), default: UserRole.ORGANIZER_STAFF })
  role: UserRole
}

export const StaffSchema = SchemaFactory.createForClass(Staff)
