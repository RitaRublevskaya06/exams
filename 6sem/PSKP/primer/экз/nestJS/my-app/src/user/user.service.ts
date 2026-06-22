import { Injectable , NotFoundException , ConflictException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


  async create(name: string, email: string): Promise<User> {
    try {
      const user = this.userRepository.create({ name, email });
      return await this.userRepository.save(user);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Пользователь с email "${email}" уже существует`);
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

 async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    
    return user;  
  }
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async update(id: number, name?: string, email?: string): Promise<User> {
    const user = await this.findOne(id);
    
    if (name) {
      user.name = name;
    }
    
    if (email) {
      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Пользователь с email "${email}" уже существует`);
      }
      user.email = email;
    }
    
    return await this.userRepository.save(user);
  }
}