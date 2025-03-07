import { BadRequestException, Injectable } from '@nestjs/common'
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

  async bookVisitDoctor(patientId: string, doctorId: string) {
    const doctor = await this.visitDoctorModel.findById(doctorId)
    if (!doctor) {
      throw new BadRequestException('Doctor not found')
    }

    const patient = await this.patientModel.findById(patientId)
    if (!patient) {
      throw new BadRequestException('Patient not found')
    }

    // Check if already booked
    const isAlreadyBooked = patient.bookedDoctors.some((d) => d.doctorId === doctorId)
    if (isAlreadyBooked) {
      throw new BadRequestException('You have already booked this doctor')
    }

    // Add doctor to patient's bookedDoctors list
    patient.bookedDoctors.push({
      doctorId,
      bookingDate: new Date(),
      status: 'Booked',
    })

    await patient.save()

    return { message: 'Doctor booked successfully', patient }
  }

  async getAvailableDoctorsAndServices(city: string) {
    const organizers = await this.organizerModel.find({ city }).select('doctors').exec()

    const visitDoctors = await this.visitDoctorModel.find({ city }).exec()

    const labs = await this.labModel.find({ city }).select('labName availableTests').exec()

    const hospitals = await this.hospitalModel.find({ city }).select('availableServices').exec()

    return {
      freeCampDoctors: organizers.flatMap((org) => org.doctors || []),
      visitDoctors,
      labServices: labs.flatMap((lab) => lab.availableTests || []),
      hospitalServices: hospitals.flatMap((hospital) => hospital.availableServices || []),
    }
  }
}
