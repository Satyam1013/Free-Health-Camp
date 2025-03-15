import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Lab } from './lab.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'

@Injectable()
export class LabService {
  constructor(
    @InjectModel(Lab.name) private labModel: Model<Lab>,
    private readonly mobileValidationService: MobileValidationService,
  ) {}

  async createStaff(labId: string, staffData: any) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new BadRequestException('Invalid lab')
      }

      // Hash password before storing
      const newStaff = { _id: new Types.ObjectId(), ...staffData }
      newStaff.password = await bcrypt.hash(newStaff.password, 10)

      // Add staff to the lab's staff array
      lab.staff.push(newStaff)
      await lab.save()

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
  async editStaff(labId: string, staffId: string, updatedData: any) {
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

  // ✅ Delete a staff member
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

  async createAvailableServices(labId: string, testData: any) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }

      lab.availableServices.push(testData.testName)
      await lab.save()
      return { message: 'Test added successfully', lab }
    } catch (error) {
      return { message: 'Error adding test', error: error.message }
    }
  }

  async getAvailableServices(labId: string) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }
      return lab.availableServices
    } catch (error) {
      return { message: 'Error fetching available tests', error: error.message }
    }
  }
}
