import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Hospital } from './hospital.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'
import { UserRole } from 'src/auth/create-user.dto'
import {
  CreateAvailableServiceDto,
  CreateDoctorDto,
  CreateStaffDto,
  EditDoctorDto,
  UpdateAvailableServiceDto,
  UpdateHospitalTimeDto,
} from './hospital.dto'
import { Doctor, Staff } from 'src/common/common.schema'

@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
    private readonly mobileValidationService: MobileValidationService,
  ) {}

  // ✅ Create a new doctor under a hospital
  async createDoctor(hospitalId: string, doctorData: CreateDoctorDto) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(doctorData.mobile)

      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid Hospital')
      }

      const newDoctor = new Doctor()
      newDoctor._id = new Types.ObjectId()
      newDoctor.name = doctorData.name
      newDoctor.address = doctorData.address
      newDoctor.mobile = doctorData.mobile
      newDoctor.password = await bcrypt.hash(doctorData.password, 10)
      newDoctor.role = doctorData.role || UserRole.HOSPITAL_DOCTOR

      // Add doctor to the hospital's doctors array
      hospital.doctors.push(newDoctor)
      await hospital.save()

      return {
        message: 'Doctor added successfully',
        doctor: {
          _id: newDoctor._id,
          name: newDoctor.name,
          mobile: newDoctor.mobile,
          role: newDoctor.role,
        },
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Edit an existing doctor
  async editDoctor(hospitalId: string, doctorId: string, updatedData: EditDoctorDto) {
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

  async createStaff(hospitalId: string, staffData: CreateStaffDto) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid hospital')
      }

      const newStaff = new Staff()
      newStaff._id = new Types.ObjectId()
      newStaff.name = staffData.name
      newStaff.address = staffData.address
      newStaff.mobile = staffData.mobile
      newStaff.password = await bcrypt.hash(staffData.password, 10)
      newStaff.role = staffData.role || UserRole.HOSPITAL_STAFF

      // Add staff to the hospital's staff array
      hospital.staff.push(newStaff)
      await hospital.save()

      return {
        message: 'Staff added successfully',
        staff: {
          _id: newStaff._id,
          name: newStaff.name,
          mobile: newStaff.mobile,
          role: newStaff.role,
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

  async createAvailableServices(hospitalId: string, serviceData: CreateAvailableServiceDto) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new Error('Hospital not found')
      }

      // Ensure serviceData contains required fields
      if (!serviceData.name || !serviceData.fee) {
        throw new Error('Invalid service data. Name and fee are required.')
      }

      // Create a new service object
      const newService = {
        _id: new Types.ObjectId(),
        name: serviceData.name,
        fee: serviceData.fee,
      }

      hospital.availableServices.push(newService)
      await hospital.save()

      return {
        message: 'Service added successfully',
        availableServices: hospital.availableServices,
      }
    } catch (error) {
      return { message: 'Error adding service', error: error.message }
    }
  }

  async updateAvailableService(hospitalId: string, serviceId: string, updatedData: UpdateAvailableServiceDto) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new NotFoundException('Hospital not found')
      }

      // Find the service by ID
      const service = hospital.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) {
        throw new BadRequestException('Service not found in hospital')
      }

      // Update properties if provided
      if (updatedData.name) service.name = updatedData.name
      if (updatedData.fee !== undefined) service.fee = updatedData.fee

      await hospital.save()
      return { message: 'Service updated successfully', service }
    } catch (error) {
      console.error('Error updating service:', error)
      throw new InternalServerErrorException('Failed to update service')
    }
  }

  /**
   * @description Delete available hospital service by ID.
   */
  async deleteAvailableService(hospitalId: string, serviceId: string) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new NotFoundException('Hospital not found')
      }

      // Find index of the service
      const initialLength = hospital.availableServices.length
      hospital.availableServices = hospital.availableServices.filter((service) => service._id.toString() !== serviceId)

      if (hospital.availableServices.length === initialLength) {
        throw new BadRequestException('Service not found in hospital')
      }

      await hospital.save()
      return { message: 'Service deleted successfully', availableServices: hospital.availableServices }
    } catch (error) {
      console.error('Error deleting service:', error)
      throw new InternalServerErrorException('Failed to delete service')
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

  async updateHospitalTime(hospitalId: string, updateTimeDto: UpdateHospitalTimeDto) {
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
