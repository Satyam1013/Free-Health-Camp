import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorDocument } from './visit-doctor.schema'
import { Model, Types } from 'mongoose'
import { Patient, PatientDocument } from 'src/patient/patient.schema'
import { BookingStatus } from 'src/common/doctor-staff.schema'
import { MobileValidationService } from 'src/common/mobile-validation.service'

@Injectable()
export class VisitDoctorService {
  constructor(
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly mobileValidationService: MobileValidationService,
  ) {}

  async createVisitDetail(visitDetailId: string, visitDetailData: any) {
    try {
      const visitDoctor = await this.visitDoctorModel.findById(visitDetailId)
      if (!visitDoctor) throw new BadRequestException('Invalid visitDoctor')

      // ✅ Check if last event was created within 24 hours
      const lastEvent = visitDoctor.visitDetails[visitDoctor.visitDetails.length - 1]
      if (lastEvent) {
        const lastEventDate = new Date(lastEvent.eventDate)
        const now = new Date()
        const hoursDifference = (now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60)
        if (hoursDifference < 24) throw new BadRequestException('Only 1 event can be created within 24 hours')
      }

      // ✅ Ensure startTime and endTime are properly parsed as Date objects
      const startTime = new Date(`${visitDetailData.eventDate}T${visitDetailData.startTime}:00.000Z`)
      const endTime = new Date(`${visitDetailData.eventDate}T${visitDetailData.endTime}:00.000Z`)

      if (startTime >= endTime) throw new BadRequestException('Start time must be before end time')

      // ✅ Explicitly assign an ObjectId to ensure `_id` is generated
      const newEvent = {
        _id: new Types.ObjectId(),
        ...visitDetailData,
        staff: [],
      }

      visitDoctor.visitDetails.push(newEvent)
      await visitDoctor.save()

      return {
        message: 'Event created successfully',
        event: newEvent,
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async createStaff(visitDoctorId: string, visitDetailId: string, staffData: any) {
    try {
      // ✅ Check if mobile exists across all collections
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      // ✅ Find VisitDoctor
      const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId)
      if (!visitDoctor) throw new BadRequestException('Invalid VisitDoctor')

      // ✅ Find the correct visitDetail entry
      const visitDetail = visitDoctor.visitDetails.find((visit) => visit._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Invalid VisitDetail')

      // ✅ Prepare new staff object with hashed password
      const newStaff = { _id: new Types.ObjectId(), ...staffData }
      newStaff.password = await bcrypt.hash(newStaff.password, 10)

      // ✅ Push staff to visitDetail.staff
      visitDetail.staff.push(newStaff)
      await visitDoctor.save()

      return {
        message: 'Staff added successfully',
        staff: {
          _id: newStaff._id,
          name: newStaff.name,
          mobile: newStaff.mobile,
        },
      }
    } catch {
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
