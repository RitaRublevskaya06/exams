import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './user/user.module';
import { User } from './user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',      
      port: 5432,             
      username: 'postgres',   
      password: 'Superstar7310013',  
      database: 'test_db',    
      entities: [User],
      synchronize: true,      
    }),
    UsersModule,
  ],
})
export class AppModule {}