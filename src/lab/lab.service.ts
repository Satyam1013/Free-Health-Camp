import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Lab } from './lab.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'
import { UserRole } from 'src/auth/create-user.dto'
import {
  CreateAvailableServiceDto,
  CreateStaffDto,
  EditStaffDto,
  UpdateAvailableServiceDto,
  UpdateLabTimeDto,
} from './lab.dto'
import { Staff } from 'src/common/common.schema'
import { PatientService } from 'src/patient/patient.service'

@Injectable()
export class LabService {
  constructor(
    @InjectModel(Lab.name) private labModel: Model<Lab>,
    private readonly mobileValidationService: MobileValidationService,
    private readonly patientService: PatientService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────────
  // * STAFF MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * @description Create a new staff member and add to the lab.
   */
  async createStaff(labId: string, staffData: CreateStaffDto) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new BadRequestException('Invalid lab')
      }

      // Hash password before storing
      const newStaff = new Staff()
      newStaff._id = new Types.ObjectId()
      newStaff.name = staffData.name
      newStaff.address = staffData.address
      newStaff.mobile = staffData.mobile
      newStaff.password = await bcrypt.hash(staffData.password, 10)
      newStaff.role = staffData.role || UserRole.LAB_STAFF

      // Add staff to the lab's staff array
      lab.staff.push(newStaff)
      await lab.save()

      return {
        message: 'Staff added successfully',
        staff: {
          _id: newStaff._id,
          name: newStaff.name,
          mobile: newStaff.mobile,
          role: newStaff.role,
        },
      }
    } catch (error) {
      console.error('Error creating staff:', error)
      throw new InternalServerErrorException(error.message)
    }
  }

  /**
   * @description Edit an existing staff member.
   */
  async editStaff(labId: string, staffId: string, updatedData: EditStaffDto) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new BadRequestException('Invalid Lab')
      }

      // Find staff member in lab's staff list
      const staffMember = lab.staff.find((s) => s._id.toString() === staffId)
      if (!staffMember) {
        throw new BadRequestException('Staff member not found')
      }

      // Update staff data
      Object.assign(staffMember, updatedData)

      // If updating password, hash it before saving
      if (updatedData.password) {
        staffMember.password = await bcrypt.hash(updatedData.password, 10)
      }

      await lab.save()
      return { message: 'Staff updated successfully', staff: staffMember }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  /**
   * @description Delete a staff member from the lab.
   */
  async deleteStaff(labId: string, staffId: string) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new BadRequestException('Invalid lab')
      }

      // Remove staff member from the array
      lab.staff = lab.staff.filter((s) => s._id.toString() !== staffId)
      await lab.save()

      return { message: 'Staff deleted successfully' }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // * LAB SERVICES
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * @description Create available lab services.
   */
  async createAvailableServices(labId: string, serviceData: CreateAvailableServiceDto) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }

      // Ensure serviceData contains required fields
      if (!serviceData.name || !serviceData.fee) {
        throw new Error('Invalid service data. Name and fee are required.')
      }

      // Create a new service object
      const newService = {
        _id: new Types.ObjectId(), // Generate a unique ID
        name: serviceData.name,
        fee: serviceData.fee,
      }

      lab.availableServices.push(newService)
      await lab.save()

      return {
        message: 'Service added successfully',
        availableServices: lab.availableServices,
      }
    } catch (error) {
      return { message: 'Error adding service', error: error.message }
    }
  }

  /**
   * @description Update available lab services.
   */

  async updateAvailableService(labId: string, serviceId: string, updatedData: UpdateAvailableServiceDto) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new NotFoundException('Lab not found')
      }

      // Find the service by ID
      const service = lab.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) {
        throw new BadRequestException('Service not found in lab')
      }

      // Update properties if provided
      if (updatedData.name) service.name = updatedData.name
      if (updatedData.fee !== undefined) service.fee = updatedData.fee

      await lab.save()
      return { message: 'Service updated successfully', service }
    } catch (error) {
      console.error('Error updating service:', error)
      throw new InternalServerErrorException('Failed to update service')
    }
  }

  /**
   * @description Delete available lab service by ID.
   */
  async deleteAvailableService(labId: string, serviceId: string) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new NotFoundException('Lab not found')
      }

      // Find index of the service
      const initialLength = lab.availableServices.length
      lab.availableServices = lab.availableServices.filter((service) => service._id.toString() !== serviceId)

      if (lab.availableServices.length === initialLength) {
        throw new BadRequestException('Service not found in lab')
      }

      await lab.save()
      return { message: 'Service deleted successfully', availableServices: lab.availableServices }
    } catch (error) {
      console.error('Error deleting service:', error)
      throw new InternalServerErrorException('Failed to delete service')
    }
  }

  /**
   * @description Get details of a specific lab.
   */
  async getLabDetails(labId: string) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }
      return lab
    } catch (error) {
      return { message: 'Error fetching available tests', error: error.message }
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // * LAB TIMING MANAGEMENT
  // ────────────────────────────────────────────────────────────────────────────────

  /**
   * @description Update lab opening and closing time.
   */
  async updateLabTime(labId: string, updateTimeDto: UpdateLabTimeDto) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new NotFoundException('Lab not found')
      }

      if (updateTimeDto.startTime) {
        lab.startTime = updateTimeDto.startTime
      }
      if (updateTimeDto.endTime) {
        lab.endTime = updateTimeDto.endTime
      }

      await lab.save()
      return { message: 'Lab time updated successfully', lab }
    } catch (error) {
      console.error('Error updating lab time:', error)
    }
  }

  async getPatientsByStaff(staffId: string) {
    try {
      // ✅ Find the lab that contains this staff
      const lab = await this.labModel.findOne({ 'staff._id': staffId }).select('_id')
      if (!lab) {
        throw new NotFoundException('Lab not found for this staff member')
      }

      const providerId = lab._id.toString()

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
