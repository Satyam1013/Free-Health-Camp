import { BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Types } from 'mongoose'
import { PatientDocument } from 'src/patient/patient.schema'
import { BookingStatus, UserRole } from './common.types'

export async function updatePatientBooking(
  patientModel: any,
  providerModel: any,
  providerRole: UserRole,
  providerId: Types.ObjectId,
  serviceId: string,
  patientId: string,
  updateData: Partial<{ status?: BookingStatus }>,
) {
  try {
    // ✅ Find the patient
    const patient: PatientDocument = await patientModel.findById(patientId)
    if (!patient) throw new BadRequestException('Patient not found')

    // ✅ Find the booked event for this provider and service
    const bookedEvent = patient.bookEvents.find(
      (event) => event.providerId.equals(providerId) && event.serviceId.equals(serviceId),
    )

    if (!bookedEvent) throw new BadRequestException('No booking found for this service and provider')

    // ✅ If status is being updated to "completed", update adminRevenue & feeBalance
    if (updateData.status === BookingStatus.Completed) {
      const provider = await providerModel.findById(providerId)
      if (!provider) throw new BadRequestException('Provider not found')

      let adminRevenueIncrease = 0

      if ([UserRole.LAB, UserRole.HOSPITAL].includes(providerRole)) {
        // ✅ For Lab & Hospital: Use availableServices fee
        const service = provider.availableServices?.find((s) => s._id.equals(serviceId))
        if (service) {
          adminRevenueIncrease = service.fee * 0.2
        }
      } else if (providerRole === UserRole.VISIT_DOCTOR) {
        // ✅ For VisitDoctor: Use visitDetails fee
        const service = provider.visitDetails?.find((s) => s._id.equals(serviceId))
        if (service) {
          adminRevenueIncrease = service.doctorFee * 0.2
        }
      }

      // ✅ Update adminRevenue & feeBalance in the provider collection
      provider.adminRevenue = (provider.adminRevenue || 0) + adminRevenueIncrease
      provider.feeBalance = (provider.feeBalance || 0) + adminRevenueIncrease // ✅ Updating feeBalance
      await provider.save()
    }

    // ✅ Update the booked event data
    Object.assign(bookedEvent, updateData)
    await patient.save()

    return { message: 'Patient status updated successfully', updatedBooking: bookedEvent }
  } catch (error) {
    throw new InternalServerErrorException(error.message || 'Something went wrong')
  }
}
