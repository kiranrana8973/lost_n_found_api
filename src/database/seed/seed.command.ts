import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  const arg = process.argv[2];
  if (arg === '-i') {
    await seedService.importData();
  } else if (arg === '-d') {
    await seedService.destroyData();
  } else {
    console.log('Please use -i to import or -d to delete data');
  }

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
