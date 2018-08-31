export interface CreateUser {
  email: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface DeleteUser {
  id: string;
}

export interface GetUser {
  id: string;
}

export interface UpdateUser {
  id: string
  email?: string;
  firstName?: string;
  lastName?: string;
}
