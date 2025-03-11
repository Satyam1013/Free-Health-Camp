import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Hospital } from './hospital.schema'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HospitalService {
  constructor(@InjectModel(Hospital.name) private hospitalModel: Model<Hospital>) {}

  async getHospitalsByCity(city: string): Promise<Hospital[]> {
    return this.hospitalModel
      .find({ hospitalLocation: city })
      .select('hospitalName hospitalLocation availableServices')
      .exec()
  }

  async createStaff(hospitalId: string, staffData: any) {
    try {
      const hospital = await this.hospitalModel.findById(hospitalId)
      if (!hospital) {
        throw new BadRequestException('Invalid hospital')
      }
      const isDuplicateStaff = hospital.staff.some((staff) => staff.mobile === staffData.mobile)

      if (isDuplicateStaff) {
        throw new BadRequestException('Mobile number already exists in doctors or staff')
      }

      // ✅ Check if mobile already exists in hospital, Doctors, or Staff
      const isMobileExists = await this.hospitalModel.findOne({
        $or: [{ 'staff.mobile': staffData.mobile }, { mobile: staffData.mobile }],
      })

      if (isMobileExists) {
        throw new BadRequestException('Mobile number already exists')
      }

      staffData.password = await bcrypt.hash(staffData.password, 10)

      hospital.staff.push(staffData)
      await hospital.save()

      return hospital
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message)
      }
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async createAvailableServices(hospitalId: string, servicesData: any) {
    try {
      const lab = await this.hospitalModel.findById(hospitalId)
      if (!lab) {
        throw new Error('Lab not found')
      }

      lab.availableServices.push(servicesData.testName)

      await lab.save()
      return { message: 'Test added successfully', lab }
    } catch (error) {
      return { message: 'Error adding test', error: error.message }
    }
  }

  async getAvailableServices(hospitalId: string) {
    try {
      const lab = await this.hospitalModel.findById(hospitalId)
      if (!lab) {
        throw new Error('Lab not found')
      }
      return lab.availableServices
    } catch (error) {
      return { message: 'Error fetching available tests', error: error.message }
    }
  }
}
