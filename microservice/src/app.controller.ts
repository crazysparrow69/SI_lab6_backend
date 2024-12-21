import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email/email.service';

@Controller()
export class AppController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('post_created')
  async handlePostCreated(@Payload() data) {
    for (const email of data.emails) {
      try {
        await this.emailService.sendEmail(
          email,
          'New post has been created!',
          `${data.user.user_role_id.name} ${data.user.name} has created a post about ${data.post.title}`,
        );
      } catch (err) {
        console.warn(`Could not send notification to ${email}`, err);
      }
    }
  }
}
