import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Admin {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ default: 'Admin' })
  role: string
}

export const AdminSchema = SchemaFactory.createForClass(Admin)
