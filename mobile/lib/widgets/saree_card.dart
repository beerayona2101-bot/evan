import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../models/product_model.dart';
import '../providers/store_provider.dart';

class SareeCard extends StatelessWidget {
  final ProductModel product;

  const SareeCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<StoreProvider>();
    final isWishlisted = store.isInWishlist(product.id);
    final cartQty = store.getQuantity(product.id);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderAmber, width: 0.8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Saree Image Container with Wishlist & Discount Badge
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                child: AspectRatio(
                  aspectRatio: 0.85,
                  child: Image.network(
                    product.images.isNotEmpty
                        ? product.images[0]
                        : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.creamBg,
                        child: const Center(
                          child: Icon(Icons.image_not_supported_outlined, color: AppColors.textMuted),
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        color: AppColors.creamBg,
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGold),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Discount Badge (Top Left)
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryBurgundy,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${product.discountPercentage}% OFF',
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      color: AppColors.goldLight,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),

              // Wishlist Heart Button (Top Right)
              Positioned(
                top: 6,
                right: 6,
                child: Material(
                  color: Colors.white.withValues(alpha: 0.9),
                  shape: const CircleBorder(),
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => store.toggleWishlist(product.id),
                    child: Padding(
                      padding: const EdgeInsets.all(6.0),
                      child: Icon(
                        isWishlisted ? Icons.favorite : Icons.favorite_border,
                        size: 18,
                        color: isWishlisted ? AppColors.crimsonRed : AppColors.textCharcoal,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Details Section
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Tag
                Text(
                  '${product.category} • ${product.fabric}'.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.6,
                    color: AppColors.primaryBurgundy,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),

                // Saree Name
                Text(
                  product.name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textCharcoal,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),

                // Pricing Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '${AppConstants.currencySymbol}${product.price.toInt()}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primaryBurgundy,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${AppConstants.currencySymbol}${product.mrp.toInt()}',
                      style: const TextStyle(
                        fontSize: 10,
                        decoration: TextDecoration.lineThrough,
                        color: AppColors.textLight,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Add to Cart / Stepper Button
                cartQty == 0
                    ? SizedBox(
                        width: double.infinity,
                        height: 32,
                        child: OutlinedButton(
                          onPressed: () => store.addToCart(product.id),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.primaryBurgundy, width: 1),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            padding: EdgeInsets.zero,
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.shopping_bag_outlined, size: 14, color: AppColors.primaryBurgundy),
                              SizedBox(width: 4),
                              Text(
                                'ADD TO CART',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.8,
                                  color: AppColors.primaryBurgundy,
                                ),
                              ),
                            ],
                          ),
                        ),
                      )
                    : Container(
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.creamBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primaryGold),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            InkWell(
                              onTap: () => store.removeFromCart(product.id),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8),
                                child: Text('-', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              ),
                            ),
                            Text(
                              '$cartQty',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                            ),
                            InkWell(
                              onTap: () => store.addToCart(product.id),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 8),
                                child: Text('+', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
