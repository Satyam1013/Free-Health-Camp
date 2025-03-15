import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VisitDoctor } from 'src/visit-doctor/visit-doctor.schema'
import { Lab } from 'src/lab/lab.schema'
import { Hospital } from 'src/hospital/hospital.schema'
import { Organizer } from 'src/organizer/organizer.schema'
import { Patient } from './patient.schema'

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Organizer>,
    @InjectModel(Organizer.name) private organizerModel: Model<Organizer>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctor>,
    @InjectModel(Lab.name) private labModel: Model<Lab>,
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
  ) {}

  async getUserDetails(userId: string) {
    try {
      const user = await this.patientModel.findById(userId).select('-password').exec()
      if (!user) throw new NotFoundException('User not found')
      return user
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to fetch user details')
    }
  }

  async getAvailableDoctorsAndServices(city: string) {
    const regex = new RegExp(`^${city}$`, 'i')

    const organizers = await this.organizerModel.find({ city: regex }).select('events').exec()
    const freeCampEvents = organizers.flatMap((org) =>
      org.events.map((event) => ({
        _id: event._id,
        eventName: event.eventName,
        eventPlace: event.eventPlace,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
        doctors: event.doctors,
      })),
    )

    const visitDoctors = await this.visitDoctorModel.find({ city: regex }).exec()

    const labs = await this.labModel.find({ city: regex }).select('username email availableTests').exec()

    const hospitals = await this.hospitalModel.find({ city: regex }).select('username email availableServices').exec()

    return {
      freeCampEvents,
      visitDoctors,
      labs,
      hospitals,
    }
  }
}
