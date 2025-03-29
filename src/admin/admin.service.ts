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
    // Fetch total counts
    const totalHospitals = await this.hospitalModel.countDocuments()
    const totalLabs = await this.labModel.countDocuments()
    const totalEvents = await this.organizerModel.aggregate([{ $unwind: '$events' }, { $count: 'totalEvents' }])

    // FreeCamp Data
    const totalPatientsBookedFreeCamp = await this.organizerModel.aggregate([
      { $unwind: '$events' },
      { $group: { _id: null, total: { $sum: '$events.totalPatients' } } },
    ])

    const totalPatientsCompletedFreeCamp = await this.organizerModel.aggregate([
      { $unwind: '$events' },
      { $group: { _id: null, total: { $sum: '$events.completedPatients' } } },
    ])

    const totalPatientsCancelledFreeCamp =
      totalPatientsBookedFreeCamp.length > 0 && totalPatientsCompletedFreeCamp.length > 0
        ? totalPatientsBookedFreeCamp[0].total - totalPatientsCompletedFreeCamp[0].total
        : 0

    // VisitDoctor Data
    const totalVisitDetails = await this.visitDoctorModel.aggregate([
      { $unwind: '$visitDetails' },
      { $count: 'totalVisitDetails' },
    ])

    const totalPatientsBookedVisitDoctor = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPatients' } } },
    ])

    const totalPatientsCompletedVisitDoctor = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, total: { $sum: '$completedPatients' } } },
    ])

    const totalPatientsCancelledVisitDoctor =
      totalPatientsBookedVisitDoctor.length > 0 && totalPatientsCompletedVisitDoctor.length > 0
        ? totalPatientsBookedVisitDoctor[0].total - totalPatientsCompletedVisitDoctor[0].total
        : 0

    const visitDoctorRevenue = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const visitDoctorPendingRevenue = await this.visitDoctorModel.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feeBalance' } } },
    ])

    // Lab Data
    const totalPatientsBookedLab = await this.labModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPatients' } } },
    ])

    const totalPatientsCompletedLab = await this.labModel.aggregate([
      { $group: { _id: null, total: { $sum: '$completedPatients' } } },
    ])

    const totalPatientsCancelledLab =
      totalPatientsBookedLab.length > 0 && totalPatientsCompletedLab.length > 0
        ? totalPatientsBookedLab[0].total - totalPatientsCompletedLab[0].total
        : 0

    const labRevenue = await this.labModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const labPendingRevenue = await this.labModel.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feeBalance' } } },
    ])

    // Weekly Data for Lab
    const weeklyLabData = await this.labModel.aggregate([
      {
        $unwind: '$weeklyData',
      },
      {
        $project: {
          week: '$weeklyData.week',
          patientsBooked: '$weeklyData.patientsBooked',
          patientsCompleted: '$weeklyData.patientsCompleted',
          patientsCancelled: '$weeklyData.patientsCancelled',
          revenue: '$weeklyData.revenue',
          pendingRevenue: '$weeklyData.pendingRevenue',
        },
      },
    ])

    // Hospital Data
    const totalPatientsBookedHospital = await this.hospitalModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPatients' } } },
    ])

    const totalPatientsCompletedHospital = await this.hospitalModel.aggregate([
      { $group: { _id: null, total: { $sum: '$completedPatients' } } },
    ])

    const totalPatientsCancelledHospital =
      totalPatientsBookedHospital.length > 0 && totalPatientsCompletedHospital.length > 0
        ? totalPatientsBookedHospital[0].total - totalPatientsCompletedHospital[0].total
        : 0

    const hospitalRevenue = await this.hospitalModel.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } },
    ])

    const hospitalPendingRevenue = await this.hospitalModel.aggregate([
      { $group: { _id: null, totalPending: { $sum: '$feeBalance' } } },
    ])

    // Weekly Data for Hospital
    const weeklyHospitalData = await this.hospitalModel.aggregate([
      {
        $unwind: '$weeklyData',
      },
      {
        $project: {
          week: '$weeklyData.week',
          patientsBooked: '$weeklyData.patientsBooked',
          patientsCompleted: '$weeklyData.patientsCompleted',
          patientsCancelled: '$weeklyData.patientsCancelled',
          revenue: '$weeklyData.revenue',
          pendingRevenue: '$weeklyData.pendingRevenue',
        },
      },
    ])

    // Return structured data
    return {
      FreeCamp: {
        totalEvents: totalEvents.length > 0 ? totalEvents[0].totalEvents : 0,
        totalPatientsBooked: totalPatientsBookedFreeCamp.length > 0 ? totalPatientsBookedFreeCamp[0].total : 0,
        totalPatientsCompleted: totalPatientsCompletedFreeCamp.length > 0 ? totalPatientsCompletedFreeCamp[0].total : 0,
        totalPatientsCancelled: totalPatientsCancelledFreeCamp,
        adminRevenue: 0,
        pendingRevenue: 0,
      },
      VisitDoctor: {
        totalVisitDetails: totalVisitDetails.length > 0 ? totalVisitDetails[0].totalVisitDetails : 0,
        totalPatientsBooked: totalPatientsBookedVisitDoctor.length > 0 ? totalPatientsBookedVisitDoctor[0].total : 0,
        totalPatientsCompleted:
          totalPatientsCompletedVisitDoctor.length > 0 ? totalPatientsCompletedVisitDoctor[0].total : 0,
        totalPatientsCancelled: totalPatientsCancelledVisitDoctor,
        adminRevenue: visitDoctorRevenue.length > 0 ? visitDoctorRevenue[0].totalRevenue : 0,
        pendingRevenue: visitDoctorPendingRevenue.length > 0 ? visitDoctorPendingRevenue[0].totalPending : 0,
      },
      Lab: {
        totalLab: totalLabs,
        totalPatientsBooked: totalPatientsBookedLab.length > 0 ? totalPatientsBookedLab[0].total : 0,
        totalPatientsCompleted: totalPatientsCompletedLab.length > 0 ? totalPatientsCompletedLab[0].total : 0,
        totalPatientsCancelled: totalPatientsCancelledLab,
        adminRevenue: labRevenue.length > 0 ? labRevenue[0].totalRevenue : 0,
        pendingRevenue: labPendingRevenue.length > 0 ? labPendingRevenue[0].totalPending : 0,
        weeklyData: weeklyLabData,
      },
      Hospital: {
        totalHospital: totalHospitals,
        totalPatientsBooked: totalPatientsBookedHospital.length > 0 ? totalPatientsBookedHospital[0].total : 0,
        totalPatientsCompleted: totalPatientsCompletedHospital.length > 0 ? totalPatientsCompletedHospital[0].total : 0,
        totalPatientsCancelled: totalPatientsCancelledHospital,
        adminRevenue: hospitalRevenue.length > 0 ? hospitalRevenue[0].totalRevenue : 0,
        pendingRevenue: hospitalPendingRevenue.length > 0 ? hospitalPendingRevenue[0].totalPending : 0,
        weeklyData: weeklyHospitalData,
      },
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
