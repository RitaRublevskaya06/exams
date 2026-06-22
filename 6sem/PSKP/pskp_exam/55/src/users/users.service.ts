import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async onModuleInit() {
        const count = await this.usersRepository.count();
        if (count === 0) {
            await this.usersRepository.save([
                { name: 'Alice', email: 'alice@example.com', age: 25 },
                { name: 'Bob', email: 'bob@example.com', age: 30 },
            ]);
        }
    }

    findAll() {
        return this.usersRepository.find();
    }

    async findOne(id: number) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    create(data: { name: string; email: string; age?: number }) {
        const user = this.usersRepository.create(data);
        return this.usersRepository.save(user);
    }

    async update(id: number, data: { name?: string; email?: string; age?: number }) {
        const user = await this.findOne(id);
        Object.assign(user, data);
        return this.usersRepository.save(user);
    }

    async delete(id: number) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User deleted' };
    }
}
