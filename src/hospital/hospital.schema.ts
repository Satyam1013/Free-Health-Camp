import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type HospitalDocument = Hospital & Document

@Schema()
export class Hospital {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  city: string

  @Prop()
  address: string

  @Prop({ required: true, default: 'Hospital' })
  role: string

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String })
  hospitalName: string

  @Prop({ type: String })
  hospitalLocation: string

  @Prop({ type: [String], default: [] })
  availableServices: string[]
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital)
