import { User, DeleteUserResponse } from '../users/model/models';

export class Database {
  private db: User[] = [
    { id: '0', email: 'user0@gmail.com', firstName: 'User', lastName: 'Zero' },
    { id: '1', email: 'user1@gmail.com', firstName: 'User', lastName: 'One' },
    { id: '2', email: 'user2@gmail.com', firstName: 'User', lastName: 'Two' }
  ];
  public async getUser(id: string): Promise<User> {
    for (const user of this.db) {
      if (user.id === id) {
        return user;
      }
    }
    throw new Error('user does not exist');
  }

  public async createUser(user: User): Promise<User> {
    this.db.push(user);
    return user;
  }

  public async deleteUser(id: string): Promise<DeleteUserResponse> {
    for (const user of this.db) {
      if (user.id === id) {
        let index = this.db.indexOf(user);
        this.db.slice(index,1);
        return {result: true};
      }
    }
    return {result: false};
  }

  public async updateUser(user: User): Promise<User> {
    if (user.error) {
      return;
    }
    for (const _user of this.db) {
      if (_user.id === user.id) {
        let index = this.db.indexOf(_user);
        Object.assign(this.db[index], user);
        return this.db[index];
        }
    }
    throw new Error('user does not exist');
  }
}
