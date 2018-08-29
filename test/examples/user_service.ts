import {User} from "./get_user_api";

export class UserService {
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

  public async deleteUser(id: string): Promise<boolean> {
    for (const user of this.db) {
      if (user.id === id) {
        let index = this.db.indexOf(user);
        this.db.slice(index,1);
        return true;
      }
    }
    return false;
  }

  public async updateUser(user: User): Promise<User> {
    for (const _user of this.db) {
      if (_user.id === user.id) {
        let index = this.db.indexOf(_user);
        this.db[index] = user;
        return user;
      }
    }
    throw new Error('user does not exist');
  }
}
