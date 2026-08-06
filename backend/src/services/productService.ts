import { ProductRepository } from '../repositories/productRepository';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async getAllProducts(filters: any) {
    const { category, fabric, occasion, fit, size, search, sort, featured } = filters;
    let query: any = {};

    if (category && category !== 'All') {
      const cleanCat = category.trim();
      query.category = { $regex: cleanCat, $options: 'i' };
    }

    if (fabric && fabric !== 'All') {
      const cleanFab = fabric.trim();
      query.fabric = { $regex: cleanFab, $options: 'i' };
    }

    if (occasion && occasion !== 'All') {
      const cleanOcc = occasion.trim();
      query.occasion = { $regex: cleanOcc, $options: 'i' };
    }

    if (size) query.sizes = size;
    if (featured === 'true') query.isFeatured = true;

    if (search) {
      const searchRegex = { $regex: search as string, $options: 'i' };
      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or },
            {
              $or: [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { fabric: searchRegex },
                { tags: searchRegex },
              ],
            },
          ],
        };
      } else {
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { fabric: searchRegex },
          { tags: searchRegex },
        ];
      }
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price-low') sortOptions = { price: 1 };
    else if (sort === 'price-high') sortOptions = { price: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };

    return await this.productRepo.findAll(query, sortOptions);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findByIdOrSlug(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async getFeaturedProducts() {
    return await this.productRepo.findFeatured(8);
  }

  async createProduct(data: any) {
    const slug = data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const sku = `EVAN-SAREE-${Math.floor(100000 + Math.random() * 900000)}`;

    return await this.productRepo.create({
      name: data.name,
      slug,
      description: data.description,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : 0,
      mrp: data.mrp ? Number(data.mrp) : Number(data.price) * 1.25,
      category: data.category || 'Banarasi Sarees',
      fit: 'Free Size',
      sizes: data.sizes || ['Free Size (5.5m + 0.8m Blouse)'],
      colors: data.colors || ['Royal Crimson Red'],
      sku,
      stock: data.stock || 25,
      images: data.images || ['/images/saree_banarasi_red.png'],
      fabric: data.fabric || 'Pure Banarasi Silk',
      blousePiece: data.blousePiece || 'Includes Unstitched Blouse Piece (0.8m)',
      borderType: data.borderType || 'Heavy Gold Zari Temple Border',
      palluStyle: 'Rich Gold Zari Woven Pallu',
      workType: 'Handloom Brocade Zari Weave',
      occasion: data.occasion || 'Bridal & Wedding',
      sareeLength: '5.5 Meters',
      sareeWidth: '1.15 Meters',
      sareeWeight: '750 Grams',
      pattern: 'Jacquard Zari Weave',
      isFeatured: data.isFeatured || false,
    });
  }

  async deleteProduct(id: string) {
    const success = await this.productRepo.delete(id);
    if (!success) throw new Error('Product not found');
    return { message: 'Product deleted successfully' };
  }
}
