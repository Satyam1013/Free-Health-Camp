export class CreateUserDto {
  readonly userName: string;
  readonly email: string;
  readonly password: string;
  // Role can be one of the four available roles
  readonly role: 'Organizer' | 'Doctor' | 'Hospital' | 'Patient';
  readonly mobile: string;
  readonly address: string;
  readonly city: string;
}
