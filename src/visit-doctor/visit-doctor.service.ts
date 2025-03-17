import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/mongoose'
import { VisitDoctor, VisitDoctorDocument } from './visit-doctor.schema'
import { Model, Types } from 'mongoose'
import { BookingStatus, Patient, PatientDocument } from 'src/patient/patient.schema'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'
import { CreateStaffDto, CreateVisitDetailDto, UpdateStaffDto, UpdateVisitDetailDto } from './visit-doctor.dto'
import { PatientService } from 'src/patient/patient.service'

@Injectable()
export class VisitDoctorService {
  constructor(
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    private readonly mobileValidationService: MobileValidationService,
    private readonly patientService: PatientService,
  ) {}

  private async findVisitDoctor(visitDoctorId: string) {
    const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId)
    if (!visitDoctor) throw new NotFoundException('Doctor not found')
    return visitDoctor
  }
  async createVisitDetail(visitDetailId: string, visitDetailData: CreateVisitDetailDto) {
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

      // ✅ Parse dates correctly
      const eventDate = new Date(visitDetailData.eventDate)
      const startTime = new Date(visitDetailData.startTime)
      const endTime = new Date(visitDetailData.endTime)

      // ✅ Ensure startTime and endTime are valid
      if (startTime < eventDate) throw new BadRequestException('Start time cannot be before the event date')
      if (startTime >= endTime) throw new BadRequestException('Start time must be before end time')

      // ✅ Explicitly assign an ObjectId to ensure `_id` is generated
      const newEvent = {
        _id: new Types.ObjectId(),
        ...visitDetailData,
        staff: [],
        patients: [],
      }

      visitDoctor.visitDetails.push(newEvent)
      await visitDoctor.save()

      return {
        message: 'Event created successfully',
        event: newEvent,
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async updateVisitDetails(visitDoctorId: string, visitDetailId: string, updateData: UpdateVisitDetailDto) {
    try {
      const visitDoctor = await this.findVisitDoctor(visitDoctorId)

      const visitDetail = visitDoctor.visitDetails.find((v) => v._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Visit detail not found')

      Object.assign(visitDetail, updateData)
      await visitDoctor.save()

      return { message: 'Visit details updated successfully', visitDetail }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async deleteVisitDetails(visitDoctorId: string, visitDetailId: string) {
    try {
      const visitDoctor = await this.findVisitDoctor(visitDoctorId)

      const visitIndex = visitDoctor.visitDetails.findIndex((v) => v._id.toString() === visitDetailId)
      if (visitIndex === -1) throw new BadRequestException('Visit detail not found')

      visitDoctor.visitDetails.splice(visitIndex, 1)
      await visitDoctor.save()

      return { message: 'Visit detail deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getAllVisitDetails(visitDoctorId: string) {
    try {
      const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId).select('visitDetails')
      if (!visitDoctor) throw new NotFoundException('Visit Doctor not found')
      return visitDoctor.visitDetails
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async createStaff(visitDoctorId: string, visitDetailId: string, staffData: CreateStaffDto) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId)
      if (!visitDoctor) throw new BadRequestException('Invalid VisitDoctor')

      const visitDetail = visitDoctor.visitDetails.find((visit) => visit._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Invalid VisitDetail')

      const newStaff = { _id: new Types.ObjectId(), ...staffData }
      newStaff.password = await bcrypt.hash(newStaff.password, 10)

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

  async updateStaff(visitDoctorId: string, visitDetailId: string, staffId: string, updateData: UpdateStaffDto) {
    try {
      const visitDoctor = await this.findVisitDoctor(visitDoctorId)

      const visitDetail = visitDoctor.visitDetails.find((v) => v._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Visit detail not found')

      const staff = visitDetail.staff.find((s) => s._id.toString() === staffId)
      if (!staff) throw new BadRequestException('Staff not found')

      Object.assign(staff, updateData)
      await visitDoctor.save()

      return { message: 'Staff updated successfully', staff }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async deleteStaff(visitDoctorId: string, visitDetailId: string, staffId: string) {
    try {
      const visitDoctor = await this.findVisitDoctor(visitDoctorId)

      const visitDetail = visitDoctor.visitDetails.find((v) => v._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Visit detail not found')

      const staffIndex = visitDetail.staff.findIndex((s) => s._id.toString() === staffId)
      if (staffIndex === -1) throw new BadRequestException('Staff not found')

      visitDetail.staff.splice(staffIndex, 1)
      await visitDoctor.save()

      return { message: 'Staff deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async updatePatient(
    visitDoctorId: string,
    serviceId: string,
    patientId: string,
    updateData: Partial<{ status?: BookingStatus; nextVisitDate?: Date }>,
  ) {
    try {
      // ✅ Find the patient
      const patient = await this.patientModel.findById(patientId)
      if (!patient) throw new BadRequestException('Patient not found')

      // ✅ Find the booked event for this provider and service
      const bookedEvent = patient.bookEvents.find(
        (event) => event.providerId.toString() === visitDoctorId && event.serviceId.toString() === serviceId,
      )

      if (!bookedEvent) throw new BadRequestException('No booking found for this service and provider')

      // ✅ Update the booked event data (status, nextVisitDate, etc.)
      Object.assign(bookedEvent, updateData)
      await patient.save()

      return { message: 'Patient status updated successfully', updatedBooking: bookedEvent }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getPatientsByStaff(staffId: string) {
    try {
      const visitDoctor = await this.visitDoctorModel.findOne({ 'visitDetails.staff._id': staffId }).select('_id')

      if (!visitDoctor) {
        throw new NotFoundException('VisitDoctor not found for this staff member')
      }

      const providerId = visitDoctor._id.toString()

      // ✅ Fetch and return patients
      return await this.patientService.getPatientsByProvider(providerId)
    } catch (error) {
      console.error('Error fetching patients for staff:', error)

      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException('Something went wrong while fetching patients')
    }
  }
}
