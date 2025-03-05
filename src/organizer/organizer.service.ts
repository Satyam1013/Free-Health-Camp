import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Organizer, OrganizerDocument } from './organizer.schema'

@Injectable()
export class OrganizerService {
  constructor(@InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>) {}

  async createDoctor(organizerId: string, doctorData: any) {
    const organizer = await this.organizerModel.findById(organizerId)
    if (!organizer) {
      throw new BadRequestException('Invalid Organizer')
    }

    const isDuplicateDoctor = organizer.doctors.some((doc) => doc.mobile === doctorData.mobile)
    const isDuplicateStaff = organizer.staff.some((staff) => staff.mobile === doctorData.mobile)

    if (isDuplicateDoctor || isDuplicateStaff) {
      throw new BadRequestException('Mobile number already exists in doctors or staff')
    }

    // ✅ Check if mobile already exists in Organizer, Doctors, or Staff
    const isMobileExists = await this.organizerModel.findOne({
      $or: [
        { 'doctors.mobile': doctorData.mobile },
        { 'staff.mobile': doctorData.mobile },
        { mobile: doctorData.mobile },
      ],
    })

    if (isMobileExists) {
      throw new BadRequestException('Mobile number already exists')
    }
    organizer.doctors.push(doctorData)
    await organizer.save()
    return organizer
  }

  async createStaff(organizerId: string, staffData: any) {
    const organizer = await this.organizerModel.findById(organizerId)
    if (!organizer) {
      throw new BadRequestException('Invalid Organizer')
    }

    organizer.staff.push(staffData)
    await organizer.save()
    return organizer
  }

  async createEvent(organizerId: string, eventData: any) {
    const organizer = await this.organizerModel.findById(organizerId)
    if (!organizer) {
      throw new BadRequestException('Invalid Organizer')
    }

    const lastEvent = organizer.events[organizer.events.length - 1]

    if (lastEvent) {
      const lastEventDate = new Date(lastEvent.eventDate)
      const now = new Date()
      const diffTime = now.getTime() - lastEventDate.getTime()
      const hoursDifference = diffTime / (1000 * 60 * 60)

      if (hoursDifference < 24) {
        throw new BadRequestException('Only 1 event can be created within 24 hours')
      }
    }

    organizer.events.push(eventData)
    await organizer.save()
    return organizer
  }
}
