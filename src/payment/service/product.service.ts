import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../entities';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}


  async findProductById(productId: string[]) : Promise<Product[]> {

    const products = this.productRepository.findProductById(productId);

    return products;
    
  }
}
