import { Controller, Post, Body, Request, UseGuards, Param, Get, Put, Delete } from '@nestjs/common'
import { OrganizerService } from './organizer.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthenticatedRequest } from 'src/common/authenticated-request'

import {
  CreateDoctorDto,
  CreateEventDto,
  CreateStaffDto,
  EditDoctorDto,
  EditEventDto,
  EditStaffDto,
} from './organizer.dto'
import { BookingStatus } from 'src/common/common.types'

@Controller('organizer')
@UseGuards(AuthGuard)
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  // ✅ Create New Event
  @Post('create-event')
  async createEvent(@Request() req: AuthenticatedRequest, @Body() eventData: CreateEventDto) {
    const organizerId = req.user._id
    return this.organizerService.createEvent(organizerId, eventData)
  }

  // ✅ Edit Event
  @Put('edit-event/:eventId')
  async editEvent(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() updatedData: EditEventDto,
  ) {
    const organizerId = req.user._id
    return this.organizerService.editEvent(organizerId, eventId, updatedData)
  }

  // ✅ Delete Event
  @Delete('delete-event/:eventId')
  async deleteEvent(@Request() req: AuthenticatedRequest, @Param('eventId') eventId: string) {
    const organizerId = req.user._id
    return this.organizerService.deleteEvent(organizerId, eventId)
  }

  // ✅ Get Events by Organizer ID
  @Get('events')
  async getAllEvents(@Request() req: AuthenticatedRequest) {
    const organizerId = req.user._id
    return this.organizerService.getAllEvents(organizerId)
  }

  // ✅ Create Doctor from an Event
  @Post('create-doctor/:eventId')
  async createDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() doctorData: CreateDoctorDto,
  ) {
    const organizerId = req.user._id
    return this.organizerService.createDoctor(organizerId, eventId, doctorData)
  }

  // ✅ Edit Doctor from an Event
  @Put('edit-doctor/:eventId/:doctorId')
  async editDoctor(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('doctorId') doctorId: string,
    @Body() updatedData: EditDoctorDto,
  ) {
    const organizerId = req.user._id
    return this.organizerService.editDoctor(organizerId, eventId, doctorId, updatedData)
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

  // ✅ Create Staff to an Event
  @Post('create-staff/:eventId')
  async createStaff(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() staffData: CreateStaffDto,
  ) {
    const organizerId = req.user._id
    return this.organizerService.createStaff(organizerId, eventId, staffData)
  }

  // ✅ Edit Staff from an Event
  @Put('edit-staff/:eventId/:staffId')
  async editStaff(
    @Request() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('staffId') staffId: string,
    @Body() updatedData: EditStaffDto,
  ) {
    const organizerId = req.user._id
    return this.organizerService.editStaff(organizerId, eventId, staffId, updatedData)
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

  // ✅ Get All Patient's from an Event
  // 👨‍⚕️👩‍⚕️ Only Staff Related
  @Get('get-all-patients')
  async getPatientsByStaff(@Request() req: AuthenticatedRequest) {
    const staffId = req.user._id
    return this.organizerService.getPatientsByStaff(staffId)
  }

  @Put(':serviceId/patient/:patientId')
  async updatePatient(
    @Request() req: AuthenticatedRequest,
    @Param('serviceId') serviceId: string,
    @Param('patientId') patientId: string,
    @Body() updateData: Partial<{ status?: BookingStatus }>,
  ) {
    const organizerId = req.user._id
    return this.organizerService.updatePatientStatus(organizerId, req.user.role, serviceId, patientId, updateData)
  }
}
