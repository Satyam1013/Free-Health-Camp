import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

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
}

export const StaffSchema = SchemaFactory.createForClass(Staff)
