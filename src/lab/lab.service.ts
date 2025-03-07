import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Lab } from './lab.schema'

@Injectable()
export class LabService {
  constructor(@InjectModel(Lab.name) private labModel: Model<Lab>) {}

  async getLabsByCity(city: string) {
    return this.labModel.find({ city }).select('labName city availableTests').exec()
  }
}
