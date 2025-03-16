import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Hospital } from './hospital.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'

@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
    private readonly mobileValidationService: MobileValidationService,
  ) {}

  // ✅ Create a new doctor under a hospital
  async createDoctor(hospitalId: string, doctorData: any) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(doctorData.mobile)

      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid Hospital')
      }

      // Hash password before storing
      const newDoctor = { _id: new Types.ObjectId(), ...doctorData }
      newDoctor.password = await bcrypt.hash(newDoctor.password, 10)

      // Add doctor to the hospital's doctors array
      hospital.doctors.push(newDoctor)
      await hospital.save()

      return {
        message: 'Doctor added successfully',
        doctor: {
          _id: newDoctor._id,
          name: newDoctor.name,
          mobile: newDoctor.mobile,
        },
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Edit an existing doctor
  async editDoctor(hospitalId: string, doctorId: string, updatedData: any) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid Hospital')
      }

      // Find doctor in hospital's doctors list
      const doctor = hospital.doctors.find((d) => d._id.toString() === doctorId)
      if (!doctor) {
        throw new BadRequestException('Doctor not found')
      }

      // Update doctor data
      Object.assign(doctor, updatedData)

      // If updating password, hash it before saving
      if (updatedData.password) {
        doctor.password = await bcrypt.hash(updatedData.password, 10)
      }

      await hospital.save()
      return { message: 'Doctor updated successfully', doctor }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Delete a doctor
  async deleteDoctor(hospitalId: string, doctorId: string) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid Hospital')
      }

      // Remove doctor from the array
      hospital.doctors = hospital.doctors.filter((d) => d._id.toString() !== doctorId)
      await hospital.save()

      return { message: 'Doctor deleted successfully' }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async createStaff(hospitalId: string, staffData: any) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid hospital')
      }

      // Hash password before storing
      const newStaff = { _id: new Types.ObjectId(), ...staffData }
      newStaff.password = await bcrypt.hash(newStaff.password, 10)

      // Add staff to the hospital's staff array
      hospital.staff.push(newStaff)
      await hospital.save()

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

  // ✅ Edit an existing staff member
  async editStaff(hospitalId: string, staffId: string, updatedData: any) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid hospital')
      }

      // Find staff member in hospital's staff list
      const staffMember = hospital.staff.find((s) => s._id.toString() === staffId)
      if (!staffMember) {
        throw new BadRequestException('Staff member not found')
      }

      // Update staff data
      Object.assign(staffMember, updatedData)

      // If updating password, hash it before saving
      if (updatedData.password) {
        staffMember.password = await bcrypt.hash(updatedData.password, 10)
      }

      await hospital.save()
      return { message: 'Staff updated successfully', staff: staffMember }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Delete a staff member
  async deleteStaff(hospitalId: string, staffId: string) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid hospital')
      }

      // Remove staff member from the array
      hospital.staff = hospital.staff.filter((s) => s._id.toString() !== staffId)
      await hospital.save()

      return { message: 'Staff deleted successfully' }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async createAvailableServices(hospitalId: string, servicesData: any) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new Error('hospital not found')
      }

      hospital.availableServices.push(servicesData.serviceName)

      await hospital.save()
      return { message: 'service added successfully', hospital }
    } catch (error) {
      return { message: 'Error adding service', error: error.message }
    }
  }

  async getHospitalDetails(hospitalId: string) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new Error('hospital not found')
      }
      return hospital
    } catch (error) {
      return { message: 'Error fetching available services', error: error.message }
    }
  }

  async updateHospitalTime(hospitalId: string, updateTimeDto: { startTime?: Date; endTime?: Date }) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new NotFoundException('Hospital not found')
      }

      if (updateTimeDto.startTime) {
        hospital.startTime = updateTimeDto.startTime
      }
      if (updateTimeDto.endTime) {
        hospital.endTime = updateTimeDto.endTime
      }

      await hospital.save()
      return { message: 'Hospital time updated successfully', hospital }
    } catch (error) {
      console.error('Error updating hospital time:', error)
    }
  }
}
