import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
    console.log('NestJS + TypeORM сервер на http://localhost:3000');
    console.log('GET /users, POST /users');
}
bootstrap();
