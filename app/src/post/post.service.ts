import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    @Inject('NOTIFICATION_SERVICE') private readonly rabbitClient: ClientProxy,
  ) {}

  async create(userId: string, post) {
    const createdPost = await this.postModel.create({ userId, ...post });

    const createdPostData = createdPost.toObject();

    const user = (
      await this.userRepository.find({
        where: { user_id: Number(createdPostData.userId) },
        relations: ['user_role_id', 'user_level_id'],
      })
    )[0];

    const usersToSendEmail = await this.userService.getUsersByUserRoleId(
      user.user_role_id.user_role_id,
    );

    this.rabbitClient.emit('post_created', {
      post: createdPostData,
      user,
      emails: usersToSendEmail
        .map((user) => user.email)
        .filter((email) => email !== user.email),
    });

    return {
      ...createdPostData,
      user,
    };
  }

  async getOne(id: string) {
    const foundPost = await this.postModel.findById(id).lean();
    if (!foundPost) {
      throw new NotFoundException('Post not found');
    }

    const user = (
      await this.userRepository.find({
        where: { user_id: Number(foundPost.userId) },
        relations: ['user_role_id', 'user_level_id'],
      })
    )[0];

    return {
      ...foundPost,
      user,
    };
  }

  async get(query) {
    const foundPosts = await this.postModel
      .find({ ...(query.userId ? { userId: query.userId } : {}) })
      .lean();

    const userIds = foundPosts.map((post) => Number(post.userId));
    let users = await this.userRepository.find({
      where: { user_id: In(userIds) },
      relations: ['user_role_id', 'user_level_id'],
    });

    if (query.userRole) {
      users = users.filter((user) => user.user_role_id.name === query.userRole);
    }
    if (query.userLevel) {
      users = users.filter(
        (user) => user.user_level_id.name === query.userLevel,
      );
    }

    const userMap = new Map(users.map((user) => [user.user_id, user]));
    const postsWithUser = foundPosts.map((post) => ({
      ...post,
      user: userMap.get(Number(post.userId)),
    }));
    const filteredPosts = postsWithUser.filter((post) => post.user);

    return {
      posts: filteredPosts,
      count: filteredPosts.length,
    };
  }

  async delete(id: string) {
    return this.postModel.findOneAndDelete({ _id: id });
  }

  async 
}
