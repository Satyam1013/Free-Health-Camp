import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Hospital } from './hospital.schema'

@Injectable()
export class HospitalService {
  constructor(@InjectModel(Hospital.name) private hospitalModel: Model<Hospital>) {}

  async createHospital(hospitalData: any): Promise<Hospital> {
    const hospital = new this.hospitalModel(hospitalData)
    return hospital.save()
  }

  async getHospitalsByCity(city: string): Promise<Hospital[]> {
    return this.hospitalModel.find({ hospitalLocation: city }).exec()
  }

  async getHospitalServices(hospitalId: string): Promise<string[]> {
    const hospital = await this.hospitalModel.findById(hospitalId).exec()
    return hospital ? hospital.availableServices : []
  }
}
