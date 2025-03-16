import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { VisitDoctor } from 'src/visit-doctor/visit-doctor.schema'
import { Lab } from 'src/lab/lab.schema'
import { Hospital } from 'src/hospital/hospital.schema'
import { Organizer } from 'src/organizer/organizer.schema'
import { BookedEvent, BookingStatus, Patient } from './patient.schema'

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
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

    const labs = await this.labModel.find({ city: regex }).select('username email availableServices').exec()

    const hospitals = await this.hospitalModel.find({ city: regex }).select('username email availableServices').exec()

    return {
      freeCampEvents,
      visitDoctors,
      labs,
      hospitals,
    }
  }

  async bookCampDoctor(city: string, serviceId: string, providerId: string, patientId: string, patientData: any) {
    try {
      const regex = new RegExp(`^${city}$`, 'i')

      // ✅ Find all organizers in the given city
      const organizers = await this.organizerModel.find({ city: regex })
      if (!organizers.length) throw new BadRequestException('No organizers found in this city')

      // ✅ Find the event within any organizer
      let event: any = null

      for (const org of organizers) {
        const foundEvent = org.events.find((ev) => ev._id.toString() === serviceId)
        if (foundEvent) {
          event = foundEvent
          break
        }
      }

      if (!event) throw new BadRequestException('Event not found in this city')

      // ✅ Find the doctor in the event
      const doctor = event.doctors.find((doc) => doc._id.toString() === providerId)
      if (!doctor) throw new BadRequestException('Doctor not found')

      // ✅ Fetch patient details
      const patient = await this.patientModel.findById(patientId)
      if (!patient) throw new BadRequestException('Patient not found')

      // ✅ Check if patient is already booked for this doctor in the same event
      const isAlreadyBooked = patient.bookEvents.some(
        (event) => event.serviceId.toString() === serviceId && event.providerId.toString() === providerId,
      )
      if (isAlreadyBooked) throw new BadRequestException('Patient already booked with this doctor')

      // ✅ Create new booking entry
      const newBooking: BookedEvent = {
        _id: new Types.ObjectId(),
        serviceId: new Types.ObjectId(serviceId),
        providerId: new Types.ObjectId(providerId),
        serviceName: event.name,
        bookingDate: new Date(patientData.bookingDate),
        status: BookingStatus.Booked,
      }

      // ✅ Add booking to patient's bookEvents array
      patient.bookEvents.push(newBooking)
      await patient.save()

      return { message: 'Doctor booked successfully', booking: newBooking }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async bookVisitDoctor(visitDoctorId: string, visitDetailId: string, patientId: string, patientData: any) {
    try {
      const doctor = await this.visitDoctorModel.findById(visitDoctorId)
      if (!doctor) throw new BadRequestException('Doctor not found')

      const visitDetail = doctor.visitDetails.find((v) => v._id.toString() === visitDetailId)
      if (!visitDetail) throw new BadRequestException('Visit Detail not found')

      const patient = await this.patientModel.findById(patientId)
      if (!patient) throw new BadRequestException('Patient not found')

      const isAlreadyBooked = patient.bookEvents.some(
        (event) => event.serviceId.toString() === visitDetailId && event.providerId.toString() === visitDoctorId,
      )
      if (isAlreadyBooked)
        throw new BadRequestException('This patient has already booked an appointment for this visit')

      const newBooking: BookedEvent = {
        _id: new Types.ObjectId(),
        serviceId: new Types.ObjectId(visitDetailId),
        providerId: new Types.ObjectId(visitDoctorId),
        serviceName: visitDetail.visitName,
        status: BookingStatus.Booked,
        bookingDate: new Date(patientData.bookingDate),
      }

      patient.bookEvents.push(newBooking)
      await patient.save()

      return {
        message: 'Visit Doctor booked successfully',
        doctor: { _id: doctor._id, name: doctor.username, address: doctor.address },
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  // ✅ Book Hospital Services
  async bookHospitalServices(providerId: string, serviceId: string, patientId: string, patientData: any) {
    try {
      const hospital = await this.hospitalModel.findById(providerId)
      if (!hospital) throw new BadRequestException('Hospital not found')

      const service = hospital.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) throw new BadRequestException('Service not found')

      const patient = await this.patientModel.findById(patientId)
      if (!patient) throw new BadRequestException('Patient not found')

      const isAlreadyBooked = patient.bookEvents.some(
        (event) => event.serviceId.toString() === serviceId && event.providerId.toString() === providerId,
      )
      if (isAlreadyBooked) throw new BadRequestException('Service already booked by this patient')

      const newBooking: BookedEvent = {
        _id: new Types.ObjectId(),
        serviceId: new Types.ObjectId(serviceId),
        providerId: new Types.ObjectId(providerId),
        serviceName: service.name,
        status: BookingStatus.Booked,
        bookingDate: new Date(patientData.bookingDate),
      }

      patient.bookEvents.push(newBooking)
      await patient.save()

      return { message: 'Hospital service booked successfully', serviceName: service.name }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  // ✅ Book Lab Services
  async bookLabServices(labId: string, serviceId: string, patientId: string, patientData: any) {
    try {
      const lab = await this.labModel.findById(labId)
      if (!lab) throw new BadRequestException('Lab not found')

      const service = lab.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) throw new BadRequestException('Service not found')

      const patient = await this.patientModel.findById(patientId)
      if (!patient) throw new BadRequestException('Patient not found')

      const isAlreadyBooked = patient.bookEvents.some(
        (event) => event.serviceId.toString() === serviceId && event.providerId.toString() === labId,
      )
      if (isAlreadyBooked) throw new BadRequestException('Service already booked by this patient')

      const newBooking: BookedEvent = {
        _id: new Types.ObjectId(),
        serviceId: new Types.ObjectId(serviceId),
        providerId: new Types.ObjectId(labId),
        serviceName: service.name,
        status: BookingStatus.Booked,
        bookingDate: new Date(patientData.bookingDate),
      }

      patient.bookEvents.push(newBooking)
      await patient.save()

      return { message: 'Lab service booked successfully', serviceName: service.name }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getPatientsByService(providerId: string, serviceId: string) {
    try {
      const patients = await this.patientModel
        .find({
          bookEvents: {
            $elemMatch: {
              providerId: new Types.ObjectId(providerId),
              serviceId: new Types.ObjectId(serviceId),
            },
          },
        })
        .select('-password')

      if (!patients.length) {
        throw new NotFoundException('No patients found for this lab service')
      }

      return patients
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new InternalServerErrorException('Something went wrong while fetching users')
    }
  }

  async getPatientsByProvider(providerId: string) {
    try {
      if (!Types.ObjectId.isValid(providerId)) {
        throw new BadRequestException('Invalid providerId')
      }

      const patients = await this.patientModel
        .find({
          'bookEvents.providerId': new Types.ObjectId(providerId),
        })
        .select('-password')

      if (!patients.length) {
        throw new NotFoundException('No patients found for this provider')
      }

      return patients
    } catch (error) {
      console.error('Error fetching patients:', error)
      throw new InternalServerErrorException('Something went wrong while fetching patients')
    }
  }
}
