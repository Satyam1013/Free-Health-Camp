import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LabController } from './lab.controller'
import { LabService } from './lab.service'
import { Lab, LabSchema } from './lab.schema'
import { AuthModule } from 'src/auth/auth.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lab.name, schema: LabSchema }]),
    forwardRef(() => AuthModule),
    MobileValidationModule,
  ],
  controllers: [LabController],
  providers: [LabService],
  exports: [MongooseModule, LabService],
})
export class LabModule {}
