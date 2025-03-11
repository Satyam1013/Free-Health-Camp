import { Prop } from '@nestjs/mongoose'

export class BaseModel {
  @Prop({ required: true })
  mobile: number

  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  address: string

  @Prop({ required: true })
  city: string
}
