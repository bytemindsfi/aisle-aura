export interface INewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export interface ILoginUser {
    email: string;
    password: string;
}

export interface IProfile {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
}