export enum UserRole {
  ORGANIZER = 'Organizer',
  HOSPITAL = 'Hospital',
  LAB = 'Lab',
  VISIT_DOCTOR = 'VisitDoctor',
  PATIENT = 'Patient',

  // ✅ Sub-Roles
  ORGANIZER_DOCTOR = 'OrganizerDoctor',
  ORGANIZER_STAFF = 'OrganizerStaff',
}

export class CreateUserDto {
  readonly username: string
  readonly email: string
  readonly password: string
  readonly role: UserRole
  readonly mobile: string
  readonly address: string
  readonly city: string
}
