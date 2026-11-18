class ProductModel {
  final String id;
  final String name;
  final double price;
  final double mrp;
  final int discountPercentage;
  final String category;
  final String fabric;
  final List<String> images;
  final double rating;
  final int numReviews;
  final int stock;
  final String description;

  ProductModel({
    required this.id,
    required this.name,
    required this.price,
    required this.mrp,
    required this.discountPercentage,
    required this.category,
    required this.fabric,
    required this.images,
    this.rating = 4.9,
    this.numReviews = 35,
    this.stock = 20,
    this.description = '',
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    final rawPrice = json['price'] ?? 0;
    final double parsedPrice = (rawPrice is num) ? rawPrice.toDouble() : double.tryParse(rawPrice.toString()) ?? 0.0;
    
    final rawMrp = json['mrp'] ?? (parsedPrice * 1.25);
    final double parsedMrp = (rawMrp is num) ? rawMrp.toDouble() : double.tryParse(rawMrp.toString()) ?? (parsedPrice * 1.25);

    List<String> parsedImages = [];
    if (json['images'] is List) {
      parsedImages = (json['images'] as List).map((e) => e.toString()).toList();
    } else if (json['image'] != null) {
      parsedImages = [json['image'].toString()];
    }
    if (parsedImages.isEmpty) {
      parsedImages = ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'];
    }

    return ProductModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? 'Royal Pure Silk Saree',
      price: parsedPrice,
      mrp: parsedMrp,
      discountPercentage: json['discountPercentage'] ?? (((parsedMrp - parsedPrice) / (parsedMrp > 0 ? parsedMrp : 1)) * 100).round(),
      category: json['category'] ?? 'Silk Saree',
      fabric: json['fabric'] ?? 'Pure Silk',
      images: parsedImages,
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.9,
      numReviews: json['numReviews'] ?? 35,
      stock: json['stock'] ?? 25,
      description: json['description'] ?? 'Exquisite pure silk saree handwoven with royal zari borders.',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      '_id': id,
      'name': name,
      'price': price,
      'mrp': mrp,
      'discountPercentage': discountPercentage,
      'category': category,
      'fabric': fabric,
      'images': images,
      'rating': rating,
      'numReviews': numReviews,
      'stock': stock,
      'description': description,
    };
  }
}
