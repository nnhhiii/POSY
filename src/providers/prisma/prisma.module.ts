import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { DatabaseConfigModule } from '../../config';

@Global()
@Module({
  imports: [DatabaseConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
