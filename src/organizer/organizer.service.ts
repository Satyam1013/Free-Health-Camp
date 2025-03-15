import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Organizer, OrganizerDocument } from './organizer.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/mobile-validation/mobile-validation.service'
import { Cron } from '@nestjs/schedule'

@Injectable()
export class OrganizerService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    private readonly mobileValidationService: MobileValidationService,
  ) {}

  // ✅ Create Event
  async createEvent(organizerId: string, eventData: any) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      // ✅ Check if last event was created within 24 hours
      const lastEvent = organizer.events[organizer.events.length - 1]
      if (lastEvent) {
        const lastEventDate = new Date(lastEvent.eventDate)
        const now = new Date()
        const hoursDifference = (now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60)
        if (hoursDifference < 24) throw new BadRequestException('Only 1 event can be created within 24 hours')
      }

      // ✅ Ensure startTime and endTime are properly parsed as Date objects
      const startTime = new Date(`${eventData.eventDate}T${eventData.startTime}:00.000Z`)
      const endTime = new Date(`${eventData.eventDate}T${eventData.endTime}:00.000Z`)

      if (startTime >= endTime) throw new BadRequestException('Start time must be before end time')

      // ✅ Explicitly assign an ObjectId to ensure `_id` is generated
      const newEvent = {
        _id: new Types.ObjectId(),
        ...eventData,
        doctors: [],
        staff: [],
      }

      organizer.events.push(newEvent)
      await organizer.save()

      return {
        message: 'Event created successfully',
        event: newEvent,
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Add Doctor to Event
  async createDoctor(organizerId: string, eventId: string, doctorData: any) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(doctorData.mobile)

      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new BadRequestException('Invalid Event')

      const newDoctor = { _id: new Types.ObjectId(), ...doctorData }

      newDoctor.password = await bcrypt.hash(newDoctor.password, 10)
      event.doctors.push(newDoctor)
      await organizer.save()

      return {
        message: 'Doctor added successfully',
        doctor: {
          _id: newDoctor._id,
          name: newDoctor.name,
          mobile: newDoctor.mobile,
        },
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Add Staff to Event
  async createStaff(organizerId: string, eventId: string, staffData: any) {
    try {
      await this.mobileValidationService.checkDuplicateMobile(staffData.mobile)

      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new BadRequestException('Invalid Event')

      const newStaff = { _id: new Types.ObjectId(), ...staffData }

      newStaff.password = await bcrypt.hash(newStaff.password, 10)

      event.staff.push(newStaff)
      await organizer.save()

      return {
        message: 'Staff added successfully',
        staff: {
          _id: newStaff._id,
          name: newStaff.name,
          mobile: newStaff.mobile,
        },
      }
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Get All Events
  async getAllEvents(organizerId: string) {
    const organizer = await this.organizerModel.findById(organizerId).select('events')
    if (!organizer) throw new NotFoundException('Organizer not found')
    return organizer.events
  }

  // ✅ Edit Event
  async editEvent(organizerId: string, eventId: string, updatedData: any) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new BadRequestException('Invalid Event')

      Object.assign(event, updatedData) // Update event details
      await organizer.save()
      return event
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Edit Doctor
  async editDoctor(organizerId: string, eventId: string, doctorId: string, updatedData: any) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new BadRequestException('Invalid Event')

      const doctor = event.doctors.find((doc) => doc._id.toString() === doctorId)
      if (!doctor) throw new BadRequestException('Doctor not found')

      Object.assign(doctor, updatedData)
      await organizer.save()
      return doctor
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Edit Staff
  async editStaff(organizerId: string, eventId: string, staffId: string, updatedData: any) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new BadRequestException('Invalid Organizer')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new BadRequestException('Invalid Event')

      const staff = event.staff.find((st) => st._id.toString() === staffId)
      if (!staff) throw new BadRequestException('Staff not found')

      Object.assign(staff, updatedData)
      await organizer.save()
      return staff
    } catch {
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  // ✅ Delete Event
  async deleteEvent(organizerId: string, eventId: string) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new NotFoundException('Organizer not found')

      const eventIndex = organizer.events.findIndex((ev) => ev._id.toString() === eventId)
      if (eventIndex === -1) throw new NotFoundException('Event not found')

      organizer.events.splice(eventIndex, 1)
      await organizer.save()

      return { message: 'Event deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  // ✅ Delete Doctor
  async deleteDoctor(organizerId: string, eventId: string, doctorId: string) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new NotFoundException('Organizer not found')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new NotFoundException('Event not found')

      const doctorIndex = event.doctors.findIndex((doc) => doc._id.toString() === doctorId)
      if (doctorIndex === -1) throw new NotFoundException('Doctor not found')

      event.doctors.splice(doctorIndex, 1)
      await organizer.save()

      return { message: 'Doctor deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  // ✅ Delete Staff
  async deleteStaff(organizerId: string, eventId: string, staffId: string) {
    try {
      const organizer = await this.organizerModel.findById(organizerId)
      if (!organizer) throw new NotFoundException('Organizer not found')

      const event = organizer.events.find((ev) => ev._id.toString() === eventId)
      if (!event) throw new NotFoundException('Event not found')

      const staffIndex = event.staff.findIndex((st) => st._id.toString() === staffId)
      if (staffIndex === -1) throw new NotFoundException('Staff not found')

      event.staff.splice(staffIndex, 1)
      await organizer.save()

      return { message: 'Staff deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  // ✅ Cron job to delete expired events (Runs every night at 2 AM)
  @Cron('0 2 * * *') // Cron syntax: 0 minute, 2 hour, every day
  async deleteExpiredEvents() {
    try {
      const now = new Date()
      const organizers = await this.organizerModel.find()

      for (const organizer of organizers) {
        const initialEventCount = organizer.events.length

        // Remove events where endTime is in the past
        organizer.events = organizer.events.filter((event) => new Date(event.endTime) > now)

        if (organizer.events.length !== initialEventCount) {
          await organizer.save()
        }
      }

      console.log('Expired events deleted successfully')
    } catch (error) {
      console.error('Error deleting expired events:', error.message)
    }
  }
}
