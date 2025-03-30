import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Hospital, HospitalDocument } from 'src/hospital/hospital.schema'
import { Lab, LabDocument } from 'src/lab/lab.schema'
import { PaidStatus } from './common.types'

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name)

  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
  ) {}

  @Cron('0 0 * * 0') // Runs every Sunday at midnight (00:00)
  async updateServiceStop() {
    try {
      console.log('hi')
      this.logger.log('Running updateServiceStop cron job...')

      // Update hospitals with pending paidStatus
      const hospitalUpdateResult = await this.hospitalModel.updateMany(
        { paidStatus: PaidStatus.PENDING },
        { $set: { serviceStop: true } },
      )

      // Update labs with pending paidStatus
      const labUpdateResult = await this.labModel.updateMany(
        { paidStatus: PaidStatus.PENDING },
        { $set: { serviceStop: true } },
      )

      this.logger.log(
        `Updated ${hospitalUpdateResult.modifiedCount} hospitals and ${labUpdateResult.modifiedCount} labs`,
      )
    } catch (error) {
      this.logger.error('Error in updateServiceStop cron job:', error)
    }
  }
}
