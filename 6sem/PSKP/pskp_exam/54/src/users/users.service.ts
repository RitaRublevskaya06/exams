import { Injectable } from '@nestjs/common';

export interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
}

@Injectable()
export class UsersService {
    private users: User[] = [
        { id: '1', name: 'Alice', email: 'alice@example.com', age: 25 },
        { id: '2', name: 'Bob', email: 'bob@example.com', age: 30 },
    ];

    findAll(): User[] {
        return this.users;
    }

    findOne(id: string): User | undefined {
        return this.users.find((u) => u.id === id);
    }

    create(data: { name: string; email: string; age?: number }): User {
        const user: User = {
            id: String(Date.now()),
            ...data,
        };
        this.users.push(user);
        return user;
    }

    update(id: string, data: { name?: string; email?: string; age?: number }): User | undefined {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) return undefined;
        this.users[index] = { ...this.users[index], ...data };
        return this.users[index];
    }

    delete(id: string): boolean {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) return false;
        this.users.splice(index, 1);
        return true;
    }
}
