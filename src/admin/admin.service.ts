import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BookingStatus, PaidStatus } from 'src/common/common.types'
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

    // ✅ Fetch all providers in the given city
    const organizers = await this.organizerModel.find({ 'events.city': regex }).exec()
    const visitDoctors = await this.visitDoctorModel.find({ 'visitDetails.city': regex }).exec()
    const labs = await this.labModel.find({ city: regex }).exec()
    const hospitals = await this.hospitalModel.find({ city: regex }).exec()

    // ✅ Extract provider IDs
    const organizerIds = organizers.map((org) => org._id)
    const visitDoctorIds = visitDoctors.map((doc) => doc._id)
    const labIds = labs.map((lab) => lab._id)
    const hospitalIds = hospitals.map((hospital) => hospital._id)

    // ✅ Fetch completed patient bookings
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

    // ✅ Compute stats with full details
    const organizerDetails = organizers.map((org) => ({
      _id: org._id,
      name: org.username,
      totalEvents: org.events.length,
      totalDoctors: org.events.reduce((sum, event) => sum + event.doctors.length, 0),
      totalStaff: org.events.reduce((sum, event) => sum + event.staff.length, 0),
      completedPatients: totalOrganizerCompletedPatients,
      events: org.events,
    }))

    const visitDoctorDetails = visitDoctors.map((doc) => ({
      _id: doc._id,
      name: doc.username,
      totalVisitDetails: doc.visitDetails.length,
      totalStaff: doc.visitDetails.reduce((sum, visit) => sum + visit.staff.length, 0),
      completedPatients: totalVisitDoctorCompletedPatients,
      visitDetails: doc.visitDetails,
      adminRevenue: doc.adminRevenue, // ✅ Added
      feeBalance: doc.feeBalance, // ✅ Added
    }))

    const labDetails = labs.map((lab) => ({
      _id: lab._id,
      name: lab.username,
      email: lab.email,
      totalServices: lab.availableServices.length,
      totalStaff: lab.staff.length,
      completedPatients: totalLabCompletedPatients,
      availableServices: lab.availableServices,
      shiftOneStartTime: lab.shiftOneStartTime,
      shiftOneEndTime: lab.shiftOneEndTime,
      shiftTwoStartTime: lab.shiftTwoStartTime,
      shiftTwoEndTime: lab.shiftTwoEndTime,
      adminRevenue: lab.adminRevenue, // ✅ Added
      feeBalance: lab.feeBalance, // ✅ Added
    }))

    const hospitalDetails = hospitals.map((hospital) => ({
      _id: hospital._id,
      name: hospital.username,
      email: hospital.email,
      totalServices: hospital.availableServices.length,
      totalDoctors: hospital.doctors.length,
      totalStaff: hospital.staff.length,
      completedPatients: totalHospitalCompletedPatients,
      availableServices: hospital.availableServices,
      shiftOneStartTime: hospital.shiftOneStartTime,
      shiftOneEndTime: hospital.shiftOneEndTime,
      shiftTwoStartTime: hospital.shiftTwoStartTime,
      shiftTwoEndTime: hospital.shiftTwoEndTime,
      adminRevenue: hospital.adminRevenue, // ✅ Added
      feeBalance: hospital.feeBalance, // ✅ Added
    }))

    return {
      organizers: organizerDetails,
      visitDoctors: visitDoctorDetails,
      labs: labDetails,
      hospitals: hospitalDetails,
    }
  }

  async updateVisitDoctorRevenue(visitDoctorId: string, updateData: { feeBalance?: number; paidStatus?: PaidStatus }) {
    const visitDoctor = await this.visitDoctorModel.findById(visitDoctorId)
    if (!visitDoctor) {
      throw new NotFoundException('Visit Doctor not found')
    }

    // ✅ Update feeBalance
    if (typeof updateData.feeBalance !== 'undefined') {
      visitDoctor.feeBalance = updateData.feeBalance
    }

    // ✅ Update paidStatus
    if (updateData.paidStatus) {
      visitDoctor.paidStatus = updateData.paidStatus

      // ✅ If paidStatus is PAID, reset feeBalance to 0
      if (updateData.paidStatus === PaidStatus.PAID) {
        visitDoctor.feeBalance = 0
      }
    }

    await visitDoctor.save()
  }

  async updateLabRevenue(ladId: string, updateData: { feeBalance?: number; paidStatus?: PaidStatus }) {
    const lab = await this.visitDoctorModel.findById(ladId)
    if (!lab) {
      throw new NotFoundException('Lab not found')
    }

    // ✅ Update feeBalance
    if (typeof updateData.feeBalance !== 'undefined') {
      lab.feeBalance = updateData.feeBalance
    }

    // ✅ Update paidStatus
    if (updateData.paidStatus) {
      lab.paidStatus = updateData.paidStatus

      // ✅ If paidStatus is PAID, reset feeBalance to 0
      if (updateData.paidStatus === PaidStatus.PAID) {
        lab.feeBalance = 0
      }
    }

    await lab.save()
  }

  async updateHospitalRevenue(hospitalId: string, updateData: { feeBalance?: number; paidStatus?: PaidStatus }) {
    const hospital = await this.visitDoctorModel.findById(hospitalId)
    if (!hospital) {
      throw new NotFoundException('Hospital not found')
    }

    // ✅ Update feeBalance
    if (typeof updateData.feeBalance !== 'undefined') {
      hospital.feeBalance = updateData.feeBalance
    }

    // ✅ Update paidStatus
    if (updateData.paidStatus) {
      hospital.paidStatus = updateData.paidStatus

      // ✅ If paidStatus is PAID, reset feeBalance to 0
      if (updateData.paidStatus === PaidStatus.PAID) {
        hospital.feeBalance = 0
      }
    }

    await hospital.save()
  }
}
