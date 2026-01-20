import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from './promotion-create-request.dto';

export class PromotionUpdateDto extends PartialType(CreatePromotionDto) {}
