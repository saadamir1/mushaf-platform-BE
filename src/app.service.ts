import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: 'Mushaf API is running!',
      timestamp: new Date().toISOString(),
      status: 'healthy',
    };
  }
}
