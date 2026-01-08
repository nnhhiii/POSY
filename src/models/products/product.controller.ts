// import { Controller } from '@nestjs/common';
// import { GrpcMethod } from '@nestjs/microservices';
// import { ProductService } from './product.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { CreateProductReq, UpdateProductReq } from '../../generated/product';

// @Controller()
// export class ProductController {
//   constructor(private readonly service: ProductService) {}

//   @GrpcMethod('ProductService', 'CreateProduct')
//   async create(req: CreateProductReq) {
//     const dto: CreateProductDto = {
//       category_id: req.categoryId,
//       sku: req.sku,
//       name: req.name,
//       description: req.description,
//       price: req.price,
//       discount_price: req.discountPrice,
//       image_url: req.imageUrl,
//     };
//     return this.service.create(dto);
//   }

//   @GrpcMethod('ProductService', 'UpdateProduct')
//   async update(req: UpdateProductReq) {
//     const dto: UpdateProductDto = {
//       id: req.id,
//       category_id: req.categoryId,
//       sku: req.sku,
//       name: req.name,
//       description: req.description,
//       price: req.price,
//       discount_price: req.discountPrice,
//       image_url: req.imageUrl,
//       is_available: req.isAvailable,
//     };
//     return this.service.update(dto);
//   }
// }
