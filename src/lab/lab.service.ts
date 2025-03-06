import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Lab } from './lab.schema'

@Injectable()
export class LabService {
  constructor(@InjectModel(Lab.name) private labModel: Model<Lab>) {}

  async getLabsByCity(city: string) {
    return this.labModel.find({ city }).select('name city services').exec()
  }

  async getLabTests(labId: string): Promise<string[]> {
    const lab = await this.labModel.findById(labId).exec()
    return lab ? lab.availableTests : []
  }
}
