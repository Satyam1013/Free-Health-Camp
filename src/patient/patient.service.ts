import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VisitDoctor } from 'src/visit-doctor/visit-doctor.schema'
import { Lab } from 'src/lab/lab.schema'
import { Hospital } from 'src/hospital/hospital.schema'
import { Organizer } from 'src/organizer/organizer.schema'

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<Organizer>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctor>,
    @InjectModel(Lab.name) private labModel: Model<Lab>,
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
  ) {}

  async getEvents(city: string) {
    return this.organizerModel.find({ city }).select('events').exec()
  }

  async getDoctorsForEvent(
    organizerId: string,
  ): Promise<Array<{ name: string; address: string; mobile: number; pass: string }>> {
    const organizer = await this.organizerModel.findById(organizerId).exec()

    if (!organizer || !organizer.doctors) {
      throw new Error('Organizer or doctors not found')
    }

    return organizer.doctors
  }

  async getVisitDoctors(city: string) {
    return this.visitDoctorModel.find({ city, type: 'visit-doctor' }).exec()
  }

  async getLabs(city: string) {
    return this.labModel.find({ city }).exec()
  }

  async getHospitals(city: string) {
    return this.hospitalModel.find({ city }).exec()
  }

  async getLabServices(labId: string) {
    return this.labModel.findById(labId).select('services').exec()
  }

  async getHospitalServices(hospitalId: string) {
    return this.hospitalModel.findById(hospitalId).select('services').exec()
  }
}
