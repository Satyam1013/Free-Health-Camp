import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorDocument } from './visit-doctor.schema'
import { Model } from 'mongoose'
import { Patient } from 'src/patient/patient.schema'

@Injectable()
export class VisitDoctorService {
  constructor(
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  async createStaff(visitDoctorId: string, staffData: any) {
    try {
      const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId)
      if (!visitDoctor) {
        throw new BadRequestException('Invalid visitDoctor')
      }
      const isDuplicateStaff = visitDoctor.staff.some((staff) => staff.mobile === staffData.mobile)

      if (isDuplicateStaff) {
        throw new BadRequestException('Mobile number already exists in doctors or staff')
      }

      // ✅ Check if mobile already exists in visitDoctor, Doctors, or Staff
      const isMobileExists = await this.visitDoctorModel.findOne({
        $or: [{ 'staff.mobile': staffData.mobile }, { mobile: staffData.mobile }],
      })

      if (isMobileExists) {
        throw new BadRequestException('Mobile number already exists')
      }

      staffData.password = await bcrypt.hash(staffData.password, 10)

      visitDoctor.staff.push(staffData)
      await visitDoctor.save()

      return visitDoctor
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async getBookedPatients(doctorId: string) {
    return this.patientModel.find({ 'bookedDoctors.doctorId': doctorId }).exec()
  }

  async getPatients(doctorId: string) {
    const visitDoctor = await this.visitDoctorModel.findById(doctorId)

    if (!visitDoctor) {
      throw new BadRequestException('Doctor not found')
    }

    return visitDoctor.patients
  }

  /**
   * 🏥 UPDATE PATIENT STATUS
   */
  async updatePatientStatus(
    doctorId: string,
    patientId: string,
    updateData: { status?: string; nextVisitDate?: string },
  ) {
    const visitDoctor = await this.visitDoctorModel.findById(doctorId)

    if (!visitDoctor) {
      throw new BadRequestException('Doctor not found')
    }

    const patient = visitDoctor.patients.find((p) => p.patientId === patientId)
    if (!patient) {
      throw new BadRequestException('Patient not found')
    }

    Object.assign(patient, updateData) // ✅ Update status or next visit date
    await visitDoctor.save()

    return { message: 'Patient status updated', patient }
  }
}
