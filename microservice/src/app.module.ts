import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        SENDGRID_EMAIL_FROM: Joi.string().required(),
        SENDGRID_API_KEY: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
