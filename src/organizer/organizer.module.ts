import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Organizer, OrganizerSchema } from './organizer.schema'
import { OrganizerService } from './organizer.service'
import { OrganizerController } from './organizer.controller'
import { AuthModule } from 'src/auth/auth.module'
import { MobileValidationModule } from 'src/mobile-validation/mobile-validation.module'
import { PatientService } from 'src/patient/patient.service'
import { PatientModule } from 'src/patient/patient.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { LabModule } from 'src/lab/lab.module'
import { HospitalModule } from 'src/hospital/hospital.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organizer.name, schema: OrganizerSchema }]),
    MobileValidationModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PatientModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => HospitalModule),
    forwardRef(() => LabModule),
  ],
  controllers: [OrganizerController],
  providers: [OrganizerService, PatientService],
  exports: [MongooseModule, OrganizerService],
})
export class OrganizerModule {}
