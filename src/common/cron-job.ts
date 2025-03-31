import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Hospital, HospitalDocument } from 'src/hospital/hospital.schema'
import { Lab, LabDocument } from 'src/lab/lab.schema'
import { PaidStatus } from './common.types'
import { VisitDoctor, VisitDoctorDocument } from 'src/visit-doctor/visit-doctor.schema'

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name)

  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
  ) {}

  @Cron('0 0 * * 0')
  async updateServiceStop() {
    try {
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

  @Cron('0 6 * * *') // Runs every day at 6 AM
  async updateVisitDoctorServiceStop() {
    try {
      this.logger.log('Running updateVisitDoctorServiceStop cron job...')

      const currentTime = new Date()

      // Update VisitDoctor's serviceStop if endTime is over and feeBalance is more than 0
      const visitDoctorUpdateResult = await this.visitDoctorModel.updateMany(
        {
          'visitDetails.endTime': { $lt: currentTime }, // endTime has passed
          feeBalance: { $gt: 0 }, // feeBalance is more than 0
          paidStatus: PaidStatus.PENDING,
        },
        { $set: { serviceStop: true } },
      )

      this.logger.log(`Updated ${visitDoctorUpdateResult.modifiedCount} visit doctors`)
    } catch (error) {
      this.logger.error('Error in updateVisitDoctorServiceStop cron job:', error)
    }
  }
}
