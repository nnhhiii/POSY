import { Module } from '@nestjs/common';
import { TokenGeneratorsService } from './token-generators.service';
import { JwtConfigModule } from '../../../config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtConfigModule, JwtModule],
  providers: [TokenGeneratorsService],
  exports: [TokenGeneratorsService],
})
export class TokenGeneratorsModule {}
