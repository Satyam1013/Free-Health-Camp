import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VisitDoctor } from 'src/visit-doctor/visit-doctor.schema'
import { Lab } from 'src/lab/lab.schema'
import { Hospital } from 'src/hospital/hospital.schema'
import { Organizer } from 'src/organizer/organizer.schema'
import { PatientDocument } from './patient.schema'

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(VisitDoctor.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Organizer.name) private organizerModel: Model<Organizer>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctor>,
    @InjectModel(Lab.name) private labModel: Model<Lab>,
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
  ) {}

  async getAvailableDoctorsAndServices(city: string) {
    const regex = new RegExp(`^${city}$`, 'i')

    const organizers = await this.organizerModel.find({ city: regex }).select('events').exec()
    const freeCampDoctors = organizers.flatMap((org) => org.events.flatMap((event) => event.doctors || []))

    const visitDoctors = await this.visitDoctorModel.find({ city: regex }).exec()

    const labs = await this.labModel.find({ city: regex }).select('username availableTests').exec()

    const hospitals = await this.hospitalModel.find({ city: regex }).select('username availableServices').exec()

    return {
      freeCampDoctors,
      visitDoctors,
      labs,
      hospitals,
    }
  }
}
