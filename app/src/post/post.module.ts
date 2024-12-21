import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './post.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/entities/user-role.entity';
import { UserLevel } from 'src/user/entities/user-level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    TypeOrmModule.forFeature([User, UserRole, UserLevel]),
    JwtModule,
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@rabbitmq:5672'],
          queue: 'notification_queue',
        },
      },
    ]),
    UserModule
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
