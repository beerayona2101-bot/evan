import 'package:flutter/material.dart';
import '../models/category_model.dart';
import '../models/product_model.dart';
import '../services/product_service.dart';

class StoreProvider extends ChangeNotifier {
  final ProductService _productService = ProductService();

  List<ProductModel> _products = [];
  List<CategoryModel> _categories = [];
  String _selectedCategory = 'All Sarees';
  bool _isLoading = false;
  bool _isServerConnected = true;

  // Cart: Product ID -> Quantity
  final Map<String, int> _cart = {};

  // Wishlist: Set of Product IDs
  final Set<String> _wishlist = {};

  List<ProductModel> get products => _products;
  List<CategoryModel> get categories => _categories;
  String get selectedCategory => _selectedCategory;
  bool get isLoading => _isLoading;
  bool get isServerConnected => _isServerConnected;

  int get cartCount => _cart.values.fold(0, (sum, qty) => sum + qty);
  int get wishlistCount => _wishlist.length;

  bool isInWishlist(String productId) => _wishlist.contains(productId);
  int getQuantity(String productId) => _cart[productId] ?? 0;

  // Load Catalog & Categories
  Future<void> loadCatalog() async {
    _isLoading = true;
    notifyListeners();

    try {
      final fetchedCategories = await _productService.getCategories();
      _categories = fetchedCategories;

      final fetchedProducts = await _productService.getProducts(category: _selectedCategory);
      _products = fetchedProducts;
      _isServerConnected = true;
    } catch (_) {
      _categories = ProductService.fallbackCategories;
      _products = ProductService.fallbackSarees;
      _isServerConnected = false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Filter by category
  Future<void> selectCategory(String categoryName) async {
    if (_selectedCategory == categoryName) return;
    _selectedCategory = categoryName;
    _isLoading = true;
    notifyListeners();

    try {
      _products = await _productService.getProducts(category: categoryName);
    } catch (_) {
      _products = ProductService.fallbackSarees
          .where((p) => categoryName == 'All Sarees' || p.category.toLowerCase().contains(categoryName.toLowerCase()))
          .toList();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Toggle Wishlist
  void toggleWishlist(String productId) {
    if (_wishlist.contains(productId)) {
      _wishlist.remove(productId);
    } else {
      _wishlist.add(productId);
    }
    notifyListeners();
  }

  // Add to Cart
  void addToCart(String productId) {
    _cart[productId] = (_cart[productId] ?? 0) + 1;
    notifyListeners();
  }

  // Remove from Cart
  void removeFromCart(String productId) {
    if (_cart.containsKey(productId)) {
      if (_cart[productId]! > 1) {
        _cart[productId] = _cart[productId]! - 1;
      } else {
        _cart.remove(productId);
      }
      notifyListeners();
    }
  }

  // Delete product completely from Cart
  void deleteFromCart(String productId) {
    _cart.remove(productId);
    notifyListeners();
  }

  // Clear entire Cart
  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  // Get active items in cart with their ProductModel
  List<MapEntry<ProductModel, int>> get cartItemsList {
    final list = <MapEntry<ProductModel, int>>[];
    for (final entry in _cart.entries) {
      if (entry.value > 0) {
        ProductModel? product;
        for (final p in _products) {
          if (p.id == entry.key) {
            product = p;
            break;
          }
        }
        if (product == null) {
          for (final p in ProductService.fallbackSarees) {
            if (p.id == entry.key) {
              product = p;
              break;
            }
          }
        }
        if (product != null) {
          list.add(MapEntry(product, entry.value));
        }
      }
    }
    return list;
  }

  // Cart subtotal
  double get cartSubtotal {
    double total = 0;
    for (final entry in cartItemsList) {
      total += entry.key.price * entry.value;
    }
    return total;
  }
}
