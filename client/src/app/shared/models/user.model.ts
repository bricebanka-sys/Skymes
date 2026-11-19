export interface User {
  firstName: string;
  lastName: string;
  email: string;
  address?: Address;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}


export type LoginData = {

  email: string;
  password: string;
}

export type RegisterData = {

  firstName: string;
  lastName: string;
} & LoginData

