import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorDocument } from './visit-doctor.schema'
import { Model, Types } from 'mongoose'
import { Patient, PatientDocument } from 'src/patient/patient.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'

@Injectable()
export class VisitDoctorService {
  constructor(
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
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
    updateData: { status?: BookingStatus; nextVisitDate?: string },
  ) {
    const visitDoctor = await this.visitDoctorModel.findById(doctorId)

    if (!visitDoctor) {
      throw new BadRequestException('Doctor not found')
    }

    const patient = visitDoctor.patients.find((p) => p._id.toString() === patientId)
    if (!patient) {
      throw new BadRequestException('Patient not found')
    }

    Object.assign(patient, updateData) // ✅ Update status or next visit date
    await visitDoctor.save()

    return { message: 'Patient status updated', patient }
  }

  async bookVisitDoctor(patientId: string, doctorId: string, patientData: any) {
    try {
      const doctor = await this.visitDoctorModel.findById(doctorId)
      if (!doctor) {
        throw new BadRequestException('Doctor not found')
      }

      const patient = await this.patientModel.findById(patientId)
      if (!patient) {
        throw new BadRequestException('Patient not found')
      }

      const patientObjectId = new Types.ObjectId(patient._id.toString())

      // Check if the patient is already booked with this doctor
      const isAlreadyBooked = doctor.patients.some((p) => p._id.toString() === patientId)
      if (isAlreadyBooked) {
        throw new BadRequestException('This patient has already booked an appointment with this doctor')
      }

      // Add patient ID to the visit doctor patients list
      const newPatient = {
        _id: patientObjectId,
        name: patient.username,
        email: patient.email,
        mobile: patient.mobile,
        gender: patient.gender,
        age: patient.age,
        bookingDate: new Date(patientData.bookingDate),
        nextVisitDate: new Date(patientData.nextVisitDate),
        status: BookingStatus.Booked,
      }

      doctor.patients.push(newPatient)
      await doctor.save()

      const safeDoctor = {
        _id: doctor._id,
        name: doctor.username,
        address: doctor.address,
      }

      return { message: 'Doctor booked successfully', doctor: safeDoctor }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }
}
