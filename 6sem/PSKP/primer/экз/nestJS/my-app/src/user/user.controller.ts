import { Controller, Get, Post, Delete, Param, Body, Put } from '@nestjs/common';
import { UsersService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()  
  create(@Body() body: { name: string; email: string }): Promise<User> {
    return this.usersService.create(body.name, body.email);
  }

  @Get() 
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id') 
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }
 @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string }
  ): Promise<User> {
    return this.usersService.update(+id, body.name, body.email);
  }
  @Delete(':id') 
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}