import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type LabDocument = Lab & Document

@Schema()
export class Lab {
  @Prop({ required: true })
  username: string

  @Prop()
  city: string

  @Prop()
  address: string

  @Prop({ required: true })
  role: 'Lab'

  @Prop({ required: true, unique: true })
  mobile: number

  @Prop({ required: true })
  password: string

  @Prop({ type: String })
  labName: string

  @Prop({ type: String })
  labLocation: string

  @Prop({ type: [String], default: [] })
  availableTests: string[]
}

export const LabSchema = SchemaFactory.createForClass(Lab)
