import { Controller, Post, Body, Request, UseGuards, Param, Get, Put, Delete } from '@nestjs/common'
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

  // ✅ Create a New Event
  @Post('create-event')
  async addEvent(@Request() req: AuthenticatedRequest, @Body() eventData: any) {
    const organizerId = req.user._id
    return this.organizerService.createEvent(organizerId, eventData)
  }

  // ✅ Add Doctor to an Event
  @Post('create-doctor/:eventId')
  async addDoctor(@Request() req: AuthenticatedRequest, @Param('eventId') eventId: string, @Body() doctorData: any) {
    const organizerId = req.user._id
    return this.organizerService.createDoctor(organizerId, eventId, doctorData)
  }

  // ✅ Add Staff to an Event
  @Post('create-staff/:eventId')
  async addStaff(@Request() req: AuthenticatedRequest, @Param('eventId') eventId: string, @Body() staffData: any) {
    const organizerId = req.user._id
    return this.organizerService.createStaff(organizerId, eventId, staffData)
  }

  @Get('events')
  async getAllEvents(@Request() req: AuthenticatedRequest) {
    const organizerId = req.user._id
    return this.organizerService.getAllEvents(organizerId)
  }

  @Put('edit-event/:eventId')
  async editEvent(@Request() req: AuthenticatedRequest, @Param('eventId') eventId: string, @Body() updatedData: any) {
    const organizerId = req.user._id
    return this.organizerService.editEvent(organizerId, eventId, updatedData)
  }

  @Put('edit-doctor/:eventId/:doctorId')
  async editDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
    @Body() updatedData: any,
  ) {
    const organizerId = req.user._id
    return this.organizerService.editDoctor(organizerId, eventId, doctorId, updatedData)
  }

  @Put('edit-staff/:eventId/:staffId')
  async editStaff(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('staffId') staffId: string,
    @Body() updatedData: any,
  ) {
    const organizerId = req.user._id
    return this.organizerService.editStaff(organizerId, eventId, staffId, updatedData)
  }

  // ✅ Delete Event
  @Delete('delete-event/:eventId')
  async deleteEvent(@Request() req: AuthenticatedRequest, @Param('eventId') eventId: string) {
    const organizerId = req.user._id
    return this.organizerService.deleteEvent(organizerId, eventId)
  }

  // ✅ Delete Doctor from an Event
  @Delete('delete-doctor/:eventId/:doctorId')
  async deleteDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
  ) {
    const organizerId = req.user._id
    return this.organizerService.deleteDoctor(organizerId, eventId, doctorId)
  }

  // ✅ Delete Staff from an Event
  @Delete('delete-staff/:eventId/:staffId')
  async deleteStaff(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('staffId') staffId: string,
  ) {
    const organizerId = req.user._id
    return this.organizerService.deleteStaff(organizerId, eventId, staffId)
  }

  // ✅ Book Doctor from an Event
  @Post('/:city/:eventId/:doctorId/book')
  async bookDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('city') city: string,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
    @Body() patientData: any,
  ) {
    const patientId = req.user._id
    return this.organizerService.bookDoctor(city, eventId, doctorId, patientId, patientData)
  }
}
