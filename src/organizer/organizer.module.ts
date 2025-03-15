import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Organizer, OrganizerSchema } from './organizer.schema'
import { OrganizerService } from './organizer.service'
import { OrganizerController } from './organizer.controller'
import { AuthModule } from 'src/auth/auth.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organizer.name, schema: OrganizerSchema }]),
    MobileValidationModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [OrganizerController],
  providers: [OrganizerService],
  exports: [MongooseModule, OrganizerService],
})
export class OrganizerModule {}
