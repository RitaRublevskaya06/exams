import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        const user = this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Post()
    create(@Body() body: { name: string; email: string; age?: number }) {
        return this.usersService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: { name?: string; email?: string; age?: number }) {
        const user = this.usersService.update(id, body);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        const deleted = this.usersService.delete(id);
        if (!deleted) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User deleted' };
    }
}
