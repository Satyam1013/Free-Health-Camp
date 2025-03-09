import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { MobileValidationService } from './mobile-validation.service'
import { Organizer, OrganizerSchema } from '../organizer/organizer.schema'
import { VisitDoctor, VisitDoctorSchema } from '../visit-doctor/visit-doctor.schema'
import { Lab, LabSchema } from '../lab/lab.schema'
import { Hospital, HospitalSchema } from '../hospital/hospital.schema'
import { Patient, PatientSchema } from '../patient/patient.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organizer.name, schema: OrganizerSchema },
      { name: VisitDoctor.name, schema: VisitDoctorSchema },
      { name: Lab.name, schema: LabSchema },
      { name: Hospital.name, schema: HospitalSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  providers: [MobileValidationService],
  exports: [MobileValidationService],
})
export class MobileValidationModule {}
