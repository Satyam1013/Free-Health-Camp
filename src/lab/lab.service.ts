import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Lab } from './lab.schema'

@Injectable()
export class LabService {
  constructor(@InjectModel(Lab.name) private labModel: Model<Lab>) {}

  async createAvailableTest(labId: string, testData: any) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }

      lab.availableTests.push(testData.testName)
      await lab.save()
      return { message: 'Test added successfully', lab }
    } catch (error) {
      return { message: 'Error adding test', error: error.message }
    }
  }

  async getAvailableTest(labId: string) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) {
        throw new Error('Lab not found')
      }
      return lab.availableTests
    } catch (error) {
      return { message: 'Error fetching available tests', error: error.message }
    }
  }
}
