import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(3000);
    console.log('NestJS сервер на http://localhost:3000');
    console.log('GET /users, POST /users, GET /users/:id');
}
bootstrap();
