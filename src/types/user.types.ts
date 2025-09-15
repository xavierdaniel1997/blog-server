export enum IUserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface IUser{
    firstName: string;
    secondName: string;
    email: string;
    password: string;
    role: IUserRole;
    avater: string;
    isValidate: boolean;
}