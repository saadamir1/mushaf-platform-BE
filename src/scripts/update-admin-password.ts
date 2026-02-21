import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

dotenv.config();

import { User } from '../users/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
  username: process.env.DB_USERNAME || 'mushaf_admin',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'mushaf_platform_db',
  entities: [User],
  synchronize: false,
  logging: false,
});

async function updatePassword() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Connected\n');

    const userRepo = AppDataSource.getRepository(User);
    
    const admin = await userRepo.findOne({ where: { email: 'admin@mushaf.com' } });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    admin.password = hashedPassword;
    await userRepo.save(admin);

    console.log('✅ Password updated successfully!');
    console.log('📧 Email: admin@mushaf.com');
    console.log('🔑 Password: Admin@123\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

updatePassword();
