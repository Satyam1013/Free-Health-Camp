import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Organizer, OrganizerDocument } from './organizer.schema'
import * as bcrypt from 'bcrypt'
import { MobileValidationService } from 'src/common/mobile-validation.service'

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

      const lastEvent = organizer.events[organizer.events.length - 1]
      if (lastEvent) {
        const lastEventDate = new Date(lastEvent.eventDate)
        const now = new Date()
        const hoursDifference = (now.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60)
        if (hoursDifference < 24) throw new BadRequestException('Only 1 event can be created within 24 hours')
      }

      // ✅ Explicitly assign an ObjectId to ensure `_id` is generated
      const newEvent = { _id: new Types.ObjectId(), ...eventData, doctors: [], staff: [] }

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

      doctorData.password = await bcrypt.hash(doctorData.password, 10)
      event.doctors.push(doctorData)
      await organizer.save()

      return event
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

      staffData.password = await bcrypt.hash(staffData.password, 10)

      event.staff.push(staffData)
      await organizer.save()

      return event
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
}
