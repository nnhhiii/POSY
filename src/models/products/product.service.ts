// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { ProductEntity } from './product.entity';
// import { Category } from '../categories/category.entity';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';

// @Injectable()
// export class ProductService {
//   constructor(
//     @InjectRepository(ProductEntity)
//     private repo: Repository<ProductEntity>,
//     @InjectRepository(Category)
//     private catRepo: Repository<Category>,
//   ) {}

//   async create(dto: CreateProductDto) {
//     const product = this.repo.create({
//       ...dto,
//       category: dto.category_id
//         ? await this.catRepo.findOneBy({ id: dto.category_id })
//         : null,
//     });

//     return { product: await this.repo.save(product) };
//   }

//   async update(dto: UpdateProductDto) {
//     const { id, category_id, ...rest } = dto;

//     const product = await this.repo.findOneBy({ id });
//     if (!product) throw new Error('Product not found');

//     if (category_id) {
//       product.category = await this.catRepo.findOneBy({ id: category_id });
//     }

//     Object.assign(product, rest);

//     return { product: await this.repo.save(product) };
//   }
// }
