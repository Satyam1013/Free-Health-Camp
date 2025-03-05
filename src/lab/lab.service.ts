import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Lab } from './lab.schema'

@Injectable()
export class LabService {
  constructor(@InjectModel(Lab.name) private labModel: Model<Lab>) {}

  async createLab(labData: any): Promise<Lab> {
    const lab = new this.labModel(labData)
    return lab.save()
  }

  async getLabsByCity(city: string): Promise<Lab[]> {
    return this.labModel.find({ labLocation: city }).exec()
  }

  async getLabTests(labId: string): Promise<string[]> {
    const lab = await this.labModel.findById(labId).exec()
    return lab ? lab.availableTests : []
  }
}
