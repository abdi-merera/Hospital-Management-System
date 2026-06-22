export type UserType = 'Admin' | 'Staff' | 'Patient';

export interface CurrentUser {
  firstName?: string;
  lastName?: string;
  userType?: UserType;
  userId?: string;
}
