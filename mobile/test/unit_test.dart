import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/category_model.dart';
import 'package:mobile/models/product_model.dart';
import 'package:mobile/models/user_model.dart';
import 'package:mobile/providers/store_provider.dart';

void main() {
  group('Aneera Silks Domain Models Unit Tests', () {
    test('UserModel serializes and deserializes properly', () {
      final json = {
        '_id': 'usr-101',
        'name': 'Ananya Sharma',
        'email': 'ananya@evan.com',
        'phone': '9490644435',
        'role': 'user',
        'token': 'jwt_test_token',
      };

      final user = UserModel.fromJson(json);
      expect(user.id, 'usr-101');
      expect(user.name, 'Ananya Sharma');
      expect(user.email, 'ananya@evan.com');
      expect(user.phone, '9490644435');
      expect(user.role, 'user');
      expect(user.token, 'jwt_test_token');

      final serialized = user.toJson();
      expect(serialized['id'], 'usr-101');
      expect(serialized['name'], 'Ananya Sharma');
    });

    test('ProductModel parses pricing, MRP, and discount percentage', () {
      final json = {
        '_id': 'p-banarasi-01',
        'name': 'Royal Crimson Banarasi Katan Silk Saree',
        'price': 14187,
        'mrp': 18999,
        'discountPercentage': 25,
        'category': 'Banarasi Silk',
        'fabric': 'Pure Katan Silk',
        'images': ['/images/saree_banarasi_red.png'],
        'stock': 10,
      };

      final product = ProductModel.fromJson(json);
      expect(product.id, 'p-banarasi-01');
      expect(product.price, 14187.0);
      expect(product.mrp, 18999.0);
      expect(product.discountPercentage, 25);
      expect(product.category, 'Banarasi Silk');
      expect(product.fabric, 'Pure Katan Silk');
      expect(product.images.first, '/images/saree_banarasi_red.png');
    });

    test('CategoryModel deserializes accurately', () {
      final json = {
        '_id': 'cat-kanchipuram',
        'name': 'Kanchipuram Silk',
        'image': 'https://images.unsplash.com/kanchipuram.jpg',
        'description': 'Pure Mulberry Silk',
      };

      final cat = CategoryModel.fromJson(json);
      expect(cat.id, 'cat-kanchipuram');
      expect(cat.name, 'Kanchipuram Silk');
      expect(cat.imageUrl, 'https://images.unsplash.com/kanchipuram.jpg');
    });

    test('StoreProvider cart and wishlist state manipulation', () {
      final store = StoreProvider();

      expect(store.cartCount, 0);
      expect(store.wishlistCount, 0);

      // Add to cart
      store.addToCart('item-1');
      expect(store.cartCount, 1);
      expect(store.getQuantity('item-1'), 1);

      store.addToCart('item-1');
      expect(store.cartCount, 2);
      expect(store.getQuantity('item-1'), 2);

      // Decrement from cart
      store.removeFromCart('item-1');
      expect(store.cartCount, 1);
      expect(store.getQuantity('item-1'), 1);

      store.removeFromCart('item-1');
      expect(store.cartCount, 0);

      // Wishlist toggle
      expect(store.isInWishlist('item-1'), false);
      store.toggleWishlist('item-1');
      expect(store.isInWishlist('item-1'), true);
      expect(store.wishlistCount, 1);

      store.toggleWishlist('item-1');
      expect(store.isInWishlist('item-1'), false);
      expect(store.wishlistCount, 0);
    });
  });
}
