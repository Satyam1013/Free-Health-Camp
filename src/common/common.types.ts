export enum PaidStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum BookingStatus {
  Booked = 'Booked',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export enum UserRole {
  ORGANIZER = 'Organizer',
  HOSPITAL = 'Hospital',
  LAB = 'Lab',
  VISIT_DOCTOR = 'VisitDoctor',
  PATIENT = 'Patient',

  // ✅ Sub-Roles
  ORGANIZER_DOCTOR = 'OrganizerDoctor',
  ORGANIZER_STAFF = 'OrganizerStaff',
  VISIT_DOCTOR_STAFF = 'VisitDoctorStaff',
  LAB_STAFF = 'LabStaff',
  HOSPITAL_DOCTOR = 'HospitalDoctor',
  HOSPITAL_STAFF = 'HospitalStaff',
}
