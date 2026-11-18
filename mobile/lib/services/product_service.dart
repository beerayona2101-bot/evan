import '../constants/app_constants.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import 'api_client.dart';

class ProductService {
  final ApiClient _client = ApiClient();

  // Authentic Aneera Silks Catalog Fallback
  static final List<ProductModel> fallbackSarees = [
    ProductModel(
      id: 'saree-01',
      name: 'Royal Crimson Banarasi Katan Silk Saree',
      price: 14187,
      mrp: 18999,
      discountPercentage: 25,
      category: 'Banarasi Silk',
      fabric: 'Pure Katan Silk',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.9,
      numReviews: 48,
      stock: 12,
      description: 'Handwoven Varanasi masterpiece crafted with pure 2-ply gold zari brocade for royal weddings.',
    ),
    ProductModel(
      id: 'saree-02',
      name: 'Imperial Emerald Kanchipuram Zari Brocade Saree',
      price: 18500,
      mrp: 24999,
      discountPercentage: 26,
      category: 'Kanchipuram Silk',
      fabric: 'Mulberry Silk',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 5.0,
      numReviews: 32,
      stock: 8,
      description: 'Authentic South Indian Kanchipuram bridal saree with pure temple zari border and rich pallu.',
    ),
    ProductModel(
      id: 'saree-03',
      name: 'Midnight Onyx Organza Handloom Silk Saree',
      price: 9800,
      mrp: 12999,
      discountPercentage: 24,
      category: 'Organza Silk',
      fabric: 'Sheer Organza',
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.8,
      numReviews: 29,
      stock: 15,
      description: 'Contemporary luxury sheer organza handloom saree tailored with delicate floral resham embroidery.',
    ),
    ProductModel(
      id: 'saree-04',
      name: 'Antique Gold Tissue Silk Festive Saree',
      price: 22000,
      mrp: 29999,
      discountPercentage: 27,
      category: 'Tissue Silk',
      fabric: 'Gold Tissue',
      images: [
        'https://images.unsplash.com/photo-1583391733975-dd28913b77ce?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.9,
      numReviews: 55,
      stock: 6,
      description: 'Luminous metallic tissue silk festive drape featuring timeless motifs and royal heritage.',
    ),
    ProductModel(
      id: 'saree-05',
      name: 'Blush Rose Handcrafted Chanderi Silk Saree',
      price: 11200,
      mrp: 14500,
      discountPercentage: 23,
      category: 'Chanderi Silk',
      fabric: 'Chanderi Cotton-Silk',
      images: [
        'https://images.unsplash.com/photo-1610030469850-7110e58d4a94?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.7,
      numReviews: 21,
      stock: 14,
      description: 'Lightweight gossamer weave with traditional gold buti weaving suitable for cocktail evenings.',
    ),
    ProductModel(
      id: 'saree-06',
      name: 'Deep Neelambari Blue Georgette Zari Saree',
      price: 15900,
      mrp: 19999,
      discountPercentage: 20,
      category: 'Georgette Silk',
      fabric: 'Pure Georgette',
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
      ],
      rating: 4.9,
      numReviews: 40,
      stock: 9,
      description: 'Flowing sheer georgette embedded with intricate silver zari jaal work for modern royalty.',
    ),
  ];

  static final List<CategoryModel> fallbackCategories = [
    CategoryModel(id: 'cat-1', name: 'All Sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'),
    CategoryModel(id: 'cat-2', name: 'Banarasi Silk', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400'),
    CategoryModel(id: 'cat-3', name: 'Kanchipuram', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400'),
    CategoryModel(id: 'cat-4', name: 'Organza Silk', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=400'),
    CategoryModel(id: 'cat-5', name: 'Tissue Silk', imageUrl: 'https://images.unsplash.com/photo-1583391733975-dd28913b77ce?auto=format&fit=crop&q=80&w=400'),
    CategoryModel(id: 'cat-6', name: 'Chanderi', imageUrl: 'https://images.unsplash.com/photo-1610030469850-7110e58d4a94?auto=format&fit=crop&q=80&w=400'),
  ];

  // Fetch Products
  Future<List<ProductModel>> getProducts({String? category}) async {
    try {
      final query = category != null && category != 'All Sarees' ? {'category': category} : null;
      final response = await _client.get(AppConstants.productsEndpoint, queryParameters: query);

      List<dynamic> list = [];
      if (response is List) {
        list = response;
      } else if (response is Map && response['products'] is List) {
        list = response['products'];
      }

      if (list.isNotEmpty) {
        return list.map((item) => ProductModel.fromJson(item)).toList();
      }
      return _filterFallback(category);
    } catch (_) {
      return _filterFallback(category);
    }
  }

  // Fetch Categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _client.get(AppConstants.categoriesEndpoint);
      if (response is List && response.isNotEmpty) {
        return [
          CategoryModel(id: 'all', name: 'All Sarees', imageUrl: fallbackCategories[0].imageUrl),
          ...response.map((item) => CategoryModel.fromJson(item)),
        ];
      }
      return fallbackCategories;
    } catch (_) {
      return fallbackCategories;
    }
  }

  List<ProductModel> _filterFallback(String? category) {
    if (category == null || category == 'All Sarees' || category.isEmpty) {
      return fallbackSarees;
    }
    return fallbackSarees.where((p) => p.category.toLowerCase().contains(category.toLowerCase())).toList();
  }
}
