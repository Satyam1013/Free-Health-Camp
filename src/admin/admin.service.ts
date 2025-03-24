import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BookingStatus } from 'src/common/common.types'
import { Hospital, HospitalDocument } from 'src/hospital/hospital.schema'
import { Lab, LabDocument } from 'src/lab/lab.schema'
import { Organizer, OrganizerDocument } from 'src/organizer/organizer.schema'
import { Patient, PatientDocument } from 'src/patient/patient.schema'
import { VisitDoctor, VisitDoctorDocument } from 'src/visit-doctor/visit-doctor.schema'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Organizer.name) private organizerModel: Model<OrganizerDocument>,
    @InjectModel(VisitDoctor.name) private visitDoctorModel: Model<VisitDoctorDocument>,
    @InjectModel(Lab.name) private labModel: Model<LabDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}

  async getDashboardStats() {
    const totalHospitals = await this.hospitalModel.countDocuments()
    const totalLabs = await this.labModel.countDocuments()
    const totalVisitDoctors = await this.visitDoctorModel.countDocuments()

    // Total Events (Assuming events are stored in the Organizer model)
    const totalEvents = await this.organizerModel.aggregate([
      { $unwind: '$events' }, // If events are stored as an array inside Organizer
      { $count: 'totalEvents' },
    ])

    // Total Visit Details (Assuming visitDetails are stored inside VisitDoctor model)
    const totalVisitDetails = await this.visitDoctorModel.aggregate([
      { $unwind: '$visitDetails' },
      { $count: 'totalVisitDetails' },
    ])

    // Calculate Total Revenue (from VisitDoctors, Labs, and Hospitals)
    const visitDoctorRevenue = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const labRevenue = await this.labModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const hospitalRevenue = await this.hospitalModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const totalRevenue =
      (visitDoctorRevenue.length > 0 ? visitDoctorRevenue[0].totalRevenue : 0) +
      (labRevenue.length > 0 ? labRevenue[0].totalRevenue : 0) +
      (hospitalRevenue.length > 0 ? hospitalRevenue[0].totalRevenue : 0)

    // Calculate Total Pending Revenue (same logic as above)
    const visitDoctorPending = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feeBalance' } } },
    ])

    const labPending = await this.labModel.aggregate([{ $group: { _id: null, totalPending: { $sum: '$feeBalance' } } }])

    const hospitalPending = await this.hospitalModel.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feeBalance' } } },
    ])

    const totalPendingRevenue =
      (visitDoctorPending.length > 0 ? visitDoctorPending[0].totalPending : 0) +
      (labPending.length > 0 ? labPending[0].totalPending : 0) +
      (hospitalPending.length > 0 ? hospitalPending[0].totalPending : 0)

    return {
      totalHospitals,
      totalLabs,
      totalVisitDoctors,
      totalEvents: totalEvents.length > 0 ? totalEvents[0].totalEvents : 0,
      totalVisitDetails: totalVisitDetails.length > 0 ? totalVisitDetails[0].totalVisitDetails : 0,
      totalRevenue,
      totalPendingRevenue,
    }
  }

  async getDashboardStatsCityWise(city: string) {
    const regex = new RegExp(`^${city}$`, 'i')

    // ✅ Find providers in the given city
    const organizers = await this.organizerModel.find({ 'events.city': regex }).exec()
    const visitDoctors = await this.visitDoctorModel.find({ 'visitDetails.city': regex }).exec()
    const labs = await this.labModel.find({ city: regex }).exec()
    const hospitals = await this.hospitalModel.find({ city: regex }).exec()

    // ✅ Extract provider IDs
    const organizerIds = organizers.map((org) => org._id)
    const visitDoctorIds = visitDoctors.map((doc) => doc._id)
    const labIds = labs.map((lab) => lab._id)
    const hospitalIds = hospitals.map((hospital) => hospital._id)

    // ✅ Fetch patients whose bookings are completed and match providers in this city
    const completedPatients = await this.patientModel
      .find({
        'bookEvents.providerId': { $in: [...organizerIds, ...visitDoctorIds, ...labIds, ...hospitalIds] },
        'bookEvents.status': BookingStatus.Completed,
      })
      .exec()

    // ✅ Initialize counters
    let totalOrganizerCompletedPatients = 0
    let totalVisitDoctorCompletedPatients = 0
    let totalLabCompletedPatients = 0
    let totalHospitalCompletedPatients = 0

    // ✅ Count completed patients per provider type
    completedPatients.forEach((patient) => {
      patient.bookEvents.forEach((event) => {
        if (event.status === BookingStatus.Completed) {
          if (organizerIds.includes(event.providerId)) {
            totalOrganizerCompletedPatients++
          } else if (visitDoctorIds.includes(event.providerId)) {
            totalVisitDoctorCompletedPatients++
          } else if (labIds.includes(event.providerId)) {
            totalLabCompletedPatients++
          } else if (hospitalIds.includes(event.providerId)) {
            totalHospitalCompletedPatients++
          }
        }
      })
    })

    // ✅ Compute additional stats from providers
    const totalEvents = organizers.reduce((acc, org) => acc + org.events.length, 0)
    const totalOrganizerDoctors = organizers.reduce(
      (acc, org) => acc + org.events.reduce((sum, event) => sum + event.doctors.length, 0),
      0,
    )
    const totalOrganizerStaff = organizers.reduce(
      (acc, org) => acc + org.events.reduce((sum, event) => sum + event.staff.length, 0),
      0,
    )

    const totalVisitDetails = visitDoctors.reduce((acc, doc) => acc + doc.visitDetails.length, 0)
    const totalVisitDoctorStaff = visitDoctors.reduce(
      (acc, doc) => acc + doc.visitDetails.reduce((sum, visit) => sum + visit.staff.length, 0),
      0,
    )

    const totalLabServices = labs.reduce((acc, lab) => acc + lab.availableServices.length, 0)
    const totalLabStaff = labs.reduce((acc, lab) => acc + lab.staff.length, 0)

    const totalHospitalServices = hospitals.reduce((acc, hospital) => acc + hospital.availableServices.length, 0)
    const totalHospitalDoctors = hospitals.reduce((acc, hospital) => acc + hospital.doctors.length, 0)
    const totalHospitalStaff = hospitals.reduce((acc, hospital) => acc + hospital.staff.length, 0)

    // ✅ Final Response
    return {
      organizer: {
        totalEvents,
        totalDoctors: totalOrganizerDoctors,
        totalStaff: totalOrganizerStaff,
        completedPatients: totalOrganizerCompletedPatients,
      },
      visitDoctor: {
        totalVisitDetails,
        totalStaff: totalVisitDoctorStaff,
        completedPatients: totalVisitDoctorCompletedPatients,
      },
      lab: {
        totalServices: totalLabServices,
        totalStaff: totalLabStaff,
        completedPatients: totalLabCompletedPatients,
      },
      hospital: {
        totalServices: totalHospitalServices,
        totalDoctors: totalHospitalDoctors,
        totalStaff: totalHospitalStaff,
        completedPatients: totalHospitalCompletedPatients,
      },
    }
  }

  async updateVisitDetailsRevenue(patientId: string, serviceId: string): Promise<void> {
    // Step 1: Find the patient
    const patient = await this.patientModel.findById(patientId)
    if (!patient) {
      throw new NotFoundException('Patient not found')
    }

    // Step 2: Check if the service is booked by the patient
    const bookedEvent = patient.bookEvents.find((event) => event.serviceId.toString() === serviceId)
    if (!bookedEvent) {
      throw new NotFoundException('Service not booked by this patient')
    }

    // Step 3: If status is COMPLETED, update VisitDoctor's revenue
    if (bookedEvent.status === BookingStatus.Completed) {
      // Find the corresponding VisitDoctor using the serviceId
      const visitDoctor = await this.visitDoctorModel.findOne({ 'visitDetails._id': serviceId })
      if (!visitDoctor) {
        throw new NotFoundException('Doctor associated with this service not found')
      }

      // Step 4: Calculate 20% admin revenue
      const visitDetail = visitDoctor.visitDetails.find((v) => v._id.toString() === serviceId)
      if (!visitDetail) {
        throw new NotFoundException('Visit details not found for this service')
      }

      const adminShare = visitDetail.doctorFee * 0.2
      visitDoctor.adminRevenue += adminShare
      visitDoctor.feeBalance -= adminShare

      await visitDoctor.save()
    }
  }

  async updateLabRevenue(patientId: string, serviceId: string): Promise<void> {
    const patient = await this.patientModel.findById(patientId)
    if (!patient) throw new NotFoundException('Patient not found')

    const bookedEvent = patient.bookEvents.find((event) => event.serviceId.toString() === serviceId)
    if (!bookedEvent) throw new NotFoundException('Service not booked by this patient')

    if (bookedEvent.status === BookingStatus.Completed) {
      const lab = await this.labModel.findOne({ 'availableServices._id': serviceId })
      if (!lab) throw new NotFoundException('Lab associated with this service not found')

      const service = lab.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) throw new NotFoundException('Service details not found in Lab')

      const adminShare = service.fee * 0.2
      lab.adminRevenue += adminShare
      lab.feeBalance -= adminShare

      await lab.save()
    }
  }

  async updateHospitalRevenue(patientId: string, serviceId: string): Promise<void> {
    const patient = await this.patientModel.findById(patientId)
    if (!patient) throw new NotFoundException('Patient not found')

    const bookedEvent = patient.bookEvents.find((event) => event.serviceId.toString() === serviceId)
    if (!bookedEvent) throw new NotFoundException('Service not booked by this patient')

    if (bookedEvent.status === BookingStatus.Completed) {
      const hospital = await this.labModel.findOne({ 'availableServices._id': serviceId })
      if (!hospital) throw new NotFoundException('Lab associated with this service not found')

      const service = hospital.availableServices.find((s) => s._id.toString() === serviceId)
      if (!service) throw new NotFoundException('Service details not found in Lab')

      const adminShare = service.fee * 0.2
      hospital.adminRevenue += adminShare
      hospital.feeBalance -= adminShare

      await hospital.save()
    }
  }
}
