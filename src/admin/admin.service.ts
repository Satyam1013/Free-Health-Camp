import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { BookingStatus, PaidStatus } from 'src/common/common.types'
import { Hospital, HospitalDocument } from 'src/hospital/hospital.schema'
import { Lab, LabDocument } from 'src/lab/lab.schema'
import { Organizer, OrganizerDocument } from 'src/organizer/organizer.schema'
import { Patient, PatientDocument } from 'src/patient/patient.schema'
import { VisitDoctor, VisitDoctorDocument } from 'src/visit-doctor/visit-doctor.schema'
import moment from 'moment'

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
    const startOfWeek = moment().startOf('week').toDate()

    const [
      totalHospitals,
      totalLabs,
      totalEvents,
      totalPatientsBookedFreeCamp,
      totalPatientsCompletedFreeCamp,
      totalVisitDetails,
      totalPatientsBookedVisitDoctor,
      totalPatientsCompletedVisitDoctor,
      visitDoctorRevenue,
      visitDoctorPendingRevenue,
      totalPatientsBookedLab,
      totalPatientsCompletedLab,
      labRevenue,
      labPendingRevenue,
      totalPatientsBookedHospital,
      totalPatientsCompletedHospital,
      hospitalRevenue,
      hospitalPendingRevenue,
      weeklyLabData,
      weeklyHospitalData,
    ] = await Promise.all([
      this.hospitalModel.countDocuments(),
      this.labModel.countDocuments(),
      this.organizerModel.aggregate([{ $unwind: '$events' }, { $count: 'totalEvents' }]),
      this.organizerModel.aggregate([
        { $unwind: '$events' },
        { $group: { _id: null, total: { $sum: '$events.totalPatients' } } },
      ]),
      this.organizerModel.aggregate([
        { $unwind: '$events' },
        { $group: { _id: null, total: { $sum: '$events.completedPatients' } } },
      ]),
      this.visitDoctorModel.aggregate([{ $unwind: '$visitDetails' }, { $count: 'totalVisitDetails' }]),
      this.patientModel.countDocuments({ providerRole: 'VisitDoctor' }),
      this.patientModel.countDocuments({ providerRole: 'VisitDoctor', status: 'Completed' }),
      this.visitDoctorModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } }]),
      this.visitDoctorModel.aggregate([{ $group: { _id: null, totalPending: { $sum: '$feeBalance' } } }]),
      this.patientModel.countDocuments({ providerRole: 'Lab' }),
      this.patientModel.countDocuments({ providerRole: 'Lab', status: 'Completed' }),
      this.labModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } }]),
      this.labModel.aggregate([{ $group: { _id: null, totalPending: { $sum: '$feeBalance' } } }]),
      this.patientModel.countDocuments({ providerRole: 'Hospital' }),
      this.patientModel.countDocuments({ providerRole: 'Hospital', status: 'Completed' }),
      this.hospitalModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$adminRevenue' } } }]),
      this.hospitalModel.aggregate([{ $group: { _id: null, totalPending: { $sum: '$feeBalance' } } }]),
      this.labModel.aggregate([
        { $unwind: '$weeklyData' },
        { $match: { 'weeklyData.startDate': startOfWeek } },
        {
          $project: {
            startDate: '$weeklyData.startDate',
            adminRevenue: '$weeklyData.adminRevenue',
            pendingRevenue: '$weeklyData.pendingRevenue',
          },
        },
      ]),
      this.hospitalModel.aggregate([
        { $unwind: '$weeklyData' },
        { $match: { 'weeklyData.startDate': startOfWeek } },
        {
          $project: {
            startDate: '$weeklyData.startDate',
            adminRevenue: '$weeklyData.adminRevenue',
            pendingRevenue: '$weeklyData.pendingRevenue',
          },
        },
      ]),
    ])

    return {
      FreeCamp: {
        totalEvents: totalEvents.length > 0 ? totalEvents[0].totalEvents : 0,
        totalPatientsBooked: totalPatientsBookedFreeCamp.length > 0 ? totalPatientsBookedFreeCamp[0].total : 0,
        totalPatientsCompleted: totalPatientsCompletedFreeCamp.length > 0 ? totalPatientsCompletedFreeCamp[0].total : 0,
        totalPatientsCancelled:
          (totalPatientsBookedFreeCamp[0]?.total || 0) - (totalPatientsCompletedFreeCamp[0]?.total || 0),
        adminRevenue: 0,
        pendingRevenue: 0,
      },
      VisitDoctor: {
        totalVisitDetails: totalVisitDetails.length > 0 ? totalVisitDetails[0].totalVisitDetails : 0,
        totalPatientsBooked: totalPatientsBookedVisitDoctor,
        totalPatientsCompleted: totalPatientsCompletedVisitDoctor,
        totalPatientsCancelled: totalPatientsBookedVisitDoctor - totalPatientsCompletedVisitDoctor,
        adminRevenue: visitDoctorRevenue.length > 0 ? visitDoctorRevenue[0].totalRevenue : 0,
        pendingRevenue: visitDoctorPendingRevenue.length > 0 ? visitDoctorPendingRevenue[0].totalPending : 0,
      },
      Lab: {
        totalLab: totalLabs,
        totalPatientsBooked: totalPatientsBookedLab,
        totalPatientsCompleted: totalPatientsCompletedLab,
        totalPatientsCancelled: totalPatientsBookedLab - totalPatientsCompletedLab,
        adminRevenue: labRevenue.length > 0 ? labRevenue[0].totalRevenue : 0,
        pendingRevenue: labPendingRevenue.length > 0 ? labPendingRevenue[0].totalPending : 0,
        weeklyData: weeklyLabData,
      },
      Hospital: {
        totalHospital: totalHospitals,
        totalPatientsBooked: totalPatientsBookedHospital,
        totalPatientsCompleted: totalPatientsCompletedHospital,
        totalPatientsCancelled: totalPatientsBookedHospital - totalPatientsCompletedHospital,
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

  async updateLabRevenue(
    labId: string,
    updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
    const lab = await this.labModel.findById(labId)
    if (!lab) {
      throw new NotFoundException('Lab not found')
    }

    // ✅ Update feeBalance if provided
    if (typeof updateData.feeBalance !== 'undefined') {
      lab.feeBalance = updateData.feeBalance
    }

    // ✅ Update paidStatus if provided
    if (updateData.paidStatus) {
      lab.paidStatus = updateData.paidStatus

      // ✅ If paidStatus is PAID, reset feeBalance to 0
      if (updateData.paidStatus === PaidStatus.PAID) {
        lab.feeBalance = 0
      }
    }

    // ✅ Update serviceStop if provided
    if (typeof updateData.serviceStop !== 'undefined') {
      lab.serviceStop = updateData.serviceStop
    }

    await lab.save()

    return { message: 'Lab revenue updated successfully' }
  }

  async updateHospitalRevenue(
    hospitalId: string,
    updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
    const hospital = await this.hospitalModel.findById(hospitalId)
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

    // ✅ Update serviceStop if provided
    if (typeof updateData.serviceStop !== 'undefined') {
      hospital.serviceStop = updateData.serviceStop
    }

    await hospital.save()
  }

  async updateVisitDoctorRevenue(
    visitDoctorId: string,
    updateData: { feeBalance?: number; paidStatus?: PaidStatus; serviceStop?: boolean },
  ) {
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

    // ✅ Update serviceStop if provided
    if (typeof updateData.serviceStop !== 'undefined') {
      visitDoctor.serviceStop = updateData.serviceStop
    }

    await visitDoctor.save()
  }

  async deleteVisitDoctor(visitDoctorId: string) {
    try {
      const visitDoctor = await this.visitDoctorModel.findByIdAndDelete(visitDoctorId)
      if (!visitDoctor) {
        throw new NotFoundException('Visit Doctor not found')
      }

      return { message: 'Doctor deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async deleteLab(labId: string) {
    try {
      const lab = await this.labModel.findByIdAndDelete(labId)
      if (!lab) {
        throw new NotFoundException('Lab not found')
      }

      return { message: 'Lab deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async deleteHospital(hospitalId: string) {
    try {
      const hospital = await this.visitDoctorModel.findByIdAndDelete(hospitalId)
      if (!hospital) {
        throw new NotFoundException('Hospital not found')
      }

      return { message: 'Hospital deleted successfully' }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getPendingLabs() {
    try {
      const lab = await this.labModel.find({ paidStatus: PaidStatus.PENDING })
      if (!lab) {
        throw new NotFoundException('Lab not found')
      }

      return lab
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getPendingHospitals() {
    try {
      const hospital = await this.hospitalModel.find({ paidStatus: PaidStatus.PENDING })
      if (!hospital) {
        throw new NotFoundException('Hospital not found')
      }

      return hospital
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }

  async getPendingVisitDoctors() {
    try {
      const visitDoctor = await this.visitDoctorModel.find({ paidStatus: PaidStatus.PENDING })
      if (!visitDoctor) {
        throw new NotFoundException('Visit Doctor not found')
      }

      return visitDoctor
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Something went wrong')
    }
  }
}
