import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Patient, PatientSchema } from './patient.schema'
import { PatientService } from './patient.service'
import { PatientController } from './patient.controller'
import { OrganizerModule } from 'src/organizer/organizer.module'
import { LabModule } from 'src/lab/lab.module'
import { HospitalModule } from 'src/hospital/hospital.module'
import { VisitDoctorModule } from 'src/visit-doctor/visit-doctor.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    forwardRef(() => OrganizerModule),
    forwardRef(() => HospitalModule),
    forwardRef(() => LabModule),
    forwardRef(() => VisitDoctorModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService, MongooseModule],
})
export class PatientModule {}
