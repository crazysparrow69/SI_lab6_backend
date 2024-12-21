import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const msg = {
      to,
      from: this.configService.get('SENDGRID_EMAIL_FROM'),
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email was sent to ${to}`);
    } catch (error) {
      throw new Error(error);
    }
  }
}
