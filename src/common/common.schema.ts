import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export class BaseModel {
  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  username: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  city: string
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
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor)

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
}

export const StaffSchema = SchemaFactory.createForClass(Staff)

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

@Schema()
export class AvailableService {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  fee: number
}

export const AvailableServiceSchema = SchemaFactory.createForClass(AvailableService)
