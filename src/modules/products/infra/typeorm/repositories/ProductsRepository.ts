import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';
import AppError from '@shared/errors/AppError';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({
      name,
      price,
      quantity
    })

    await this.ormRepository.save(product)

    return product
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: {
        name
      }
    })

    return product
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    
    const idProducts = products.map(product => product.id)
    
    const orderProducts = await this.ormRepository.find({ id: In(idProducts)})

    if(idProducts.length !== orderProducts.length){
      throw new AppError('Missing product')
    }

    return orderProducts
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsData = await this.findAllById(products)

    const newProducts = productsData.map(productData => {
      const product = products.find(productFind => productFind.id === productData.id)

      if(!product){
        throw new AppError('Product not found.')
      }

      if(productData.quantity < product.quantity){
        throw new AppError('Insuficient product quantity.')
      }
      
      productData.quantity -= product.quantity

      return productData
    })

    await this.ormRepository.save(newProducts)

    return newProducts
  }
}

export default ProductsRepository;
