import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Organizer, OrganizerDocument } from '../organizer/organizer.schema'
import { VisitDoctor, VisitDoctorDocument } from '../visit-doctor/visit-doctor.schema'
import { Lab, LabDocument } from '../lab/lab.schema'
import { Hospital, HospitalDocument } from '../hospital/hospital.schema'
import { Patient, PatientDocument } from '../patient/patient.schema'

@Injectable()
export class MobileValidationService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async checkDuplicateMobile(mobile: number): Promise<void> {
    const existingUser = await Promise.all([
      // Main roles
      this.organizerModel.findOne({ mobile }),
      this.hospitalModel.findOne({ mobile }),
      this.labModel.findOne({ mobile }),
      this.visitDoctorModel.findOne({ mobile }),
      this.patientModel.findOne({ mobile }),

      // Sub-roles within Organizer
      this.organizerModel.findOne({ 'events.doctors.mobile': mobile }), // OrganizerDoctor
      this.organizerModel.findOne({ 'events.staff.mobile': mobile }), // OrganizerStaff

      // Sub-roles within VisitDoctor
      this.visitDoctorModel.findOne({ 'visitDetails.staff.mobile': mobile }), // VisitDoctorStaff
      this.visitDoctorModel.findOne({ 'visitDetails.doctors.mobile': mobile }), // VisitDoctor (if doctors exist)

      // Sub-roles within Hospital
      this.hospitalModel.findOne({ 'doctors.mobile': mobile }), // HospitalDoctor
      this.hospitalModel.findOne({ 'staff.mobile': mobile }), // HospitalStaff

      // Sub-roles within Lab
      this.labModel.findOne({ 'staff.mobile': mobile }), // LabStaff
    ])

    if (existingUser.some((user) => user !== null)) {
      throw new BadRequestException('Mobile number already exists!')
    }
  }
}
