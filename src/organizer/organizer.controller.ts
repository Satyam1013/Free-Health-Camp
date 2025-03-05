import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common'
import { OrganizerService } from './organizer.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { Request as ExpressRequest } from 'express'

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    _id: string
    role?: string
  }
}

@Controller('organizer')
@UseGuards(AuthGuard)
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Post('create-doctor')
  async addDoctor(@Request() req: AuthenticatedRequest, @Body() doctorData: any) {
    const organizerId = req.user._id
    return this.organizerService.createDoctor(organizerId, doctorData)
  }

  @Post('create-staff')
  async addStaff(@Request() req: AuthenticatedRequest, @Body() staffData: any) {
    const organizerId = req.user._id
    return this.organizerService.createStaff(organizerId, staffData)
  }

  @Post('create-event')
  async addEvent(@Request() req: AuthenticatedRequest, @Body() eventData: any) {
    const organizerId = req.user._id
    return this.organizerService.createEvent(organizerId, eventData)
  }
}
