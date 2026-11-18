import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../constants/app_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/store_provider.dart';
import '../widgets/luxury_button.dart';
import '../widgets/saree_card.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentBottomNavIndex = 0;
  final PageController _bannerController = PageController();
  int _currentBannerIndex = 0;

  final List<Map<String, String>> _heroBanners = [
    {
      'title': 'ROYAL KANCHIPURAM',
      'tagline': 'PURE TEMPLE ZARI WEAVES',
      'image': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
    },
    {
      'title': 'IMPERIAL BANARASI',
      'tagline': 'HERITAGE BRIDAL BROCADES',
      'image': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
    },
    {
      'title': 'METALLIC TISSUE SILK',
      'tagline': 'LUMINOUS FESTIVE ATELIER',
      'image': 'https://images.unsplash.com/photo-1583391733975-dd28913b77ce?auto=format&fit=crop&q=80&w=1200',
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StoreProvider>().loadCatalog();
    });
  }

  @override
  void dispose() {
    _bannerController.dispose();
    super.dispose();
  }

  // Server Configuration Dialog (Allows user to test on emulator or real physical device)
  void _showServerConfigDialog() {
    final controller = TextEditingController(text: AppConstants.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(
          children: [
            Icon(Icons.dns_outlined, color: AppColors.primaryBurgundy, size: 22),
            SizedBox(width: 8),
            Text(
              'Server Connectivity',
              style: TextStyle(fontFamily: 'serif', fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Node.js Server Base URL:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textCharcoal),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'http://10.0.2.2:5000/api',
              ),
              style: const TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            const Text(
              '• Android Emulator: http://10.0.2.2:5000/api\n• iOS Simulator: http://127.0.0.1:5000/api\n• Physical Device: http://<your-wifi-ip>:5000/api',
              style: TextStyle(fontSize: 10, color: AppColors.textMuted, height: 1.4),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              AppConstants.baseUrl = controller.text.trim();
              Navigator.pop(ctx);
              context.read<StoreProvider>().loadCatalog();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppColors.emeraldGreen,
                  content: Text('Server connected to: ${AppConstants.baseUrl}'),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryBurgundy,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Text('Save & Reconnect', style: TextStyle(fontSize: 11, color: AppColors.goldLight)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<StoreProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.pearlWhite,
      // Luxury Atelier App Bar
      appBar: AppBar(
        title: Column(
          children: [
            const Text(
              'ANEERA SILKS',
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 2.5,
                color: AppColors.textCharcoal,
              ),
            ),
            Text(
              'EVAN SAREE ATELIER'.toUpperCase(),
              style: const TextStyle(
                fontSize: 8.5,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.5,
                color: AppColors.primaryBurgundy,
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppColors.textCharcoal),
          onPressed: () {
            // Quick Drawer / Atelier info
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  auth.isAuthenticated
                      ? 'Signed in as ${auth.currentUser?.name} (${auth.currentUser?.email})'
                      : 'Visiting as Guest Atelier Customer',
                ),
                backgroundColor: AppColors.primaryBurgundy,
              ),
            );
          },
        ),
        actions: [
          // Server status pill
          GestureDetector(
            onTap: _showServerConfigDialog,
            child: Container(
              margin: const EdgeInsets.symmetric(vertical: 12),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: store.isServerConnected
                    ? AppColors.emeraldGreen.withValues(alpha: 0.12)
                    : Colors.amber.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: store.isServerConnected ? AppColors.emeraldGreen : Colors.amber.shade800,
                  width: 0.8,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.circle,
                    size: 8,
                    color: store.isServerConnected ? AppColors.emeraldGreen : Colors.amber.shade800,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    store.isServerConnected ? 'LIVE' : 'DEMO',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: store.isServerConnected ? AppColors.emeraldGreen : Colors.amber.shade900,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),

          // Cart with reactive badge
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined, color: AppColors.textCharcoal),
                onPressed: () {
                  setState(() => _currentBottomNavIndex = 3);
                },
              ),
              if (store.cartCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.crimsonRed,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${store.cartCount}',
                      style: const TextStyle(
                        fontSize: 9,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),

      body: _currentBottomNavIndex == 3
          ? _buildCartView(store, auth)
          : RefreshIndicator(
              color: AppColors.primaryBurgundy,
              onRefresh: () => store.loadCatalog(),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
              // 1. RECTANGULAR HERO LANDSCAPE CAROUSEL (Mobile responsive format)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                height: 180,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primaryGold, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(19),
                  child: Stack(
                    children: [
                      // PageView Banners
                      PageView.builder(
                        controller: _bannerController,
                        itemCount: _heroBanners.length,
                        onPageChanged: (idx) => setState(() => _currentBannerIndex = idx),
                        itemBuilder: (context, idx) {
                          final banner = _heroBanners[idx];
                          return Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.network(
                                banner['image']!,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(color: AppColors.burgundyDark),
                              ),
                              // Luxury dark gradient overlay
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Colors.black.withValues(alpha: 0.75),
                                      Colors.black.withValues(alpha: 0.2),
                                    ],
                                    begin: Alignment.bottomLeft,
                                    end: Alignment.topRight,
                                  ),
                                ),
                              ),
                              // Banner Text Info (Heading only, clean as requested)
                              Positioned(
                                left: 16,
                                bottom: 16,
                                right: 16,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      banner['tagline']!,
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 2.0,
                                        color: AppColors.primaryGold,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      banner['title']!,
                                      style: const TextStyle(
                                        fontFamily: 'serif',
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          );
                        },
                      ),

                      // Carousel Indicators
                      Positioned(
                        bottom: 8,
                        right: 12,
                        child: Row(
                          children: List.generate(_heroBanners.length, (idx) {
                            final isActive = idx == _currentBannerIndex;
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 2.5),
                              width: isActive ? 16 : 6,
                              height: 5,
                              decoration: BoxDecoration(
                                color: isActive ? AppColors.primaryGold : Colors.white54,
                                borderRadius: BorderRadius.circular(3),
                              ),
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 2. CATEGORY HORIZONTAL FILTER CHIPS
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'COLLECTIONS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        color: AppColors.textCharcoal,
                      ),
                    ),
                    Text(
                      '${store.products.length} Sarees',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),

              SizedBox(
                height: 38,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: store.categories.length,
                  itemBuilder: (context, idx) {
                    final cat = store.categories[idx];
                    final isSelected = store.selectedCategory == cat.name;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cat.name),
                        selected: isSelected,
                        onSelected: (_) => store.selectCategory(cat.name),
                        selectedColor: AppColors.primaryBurgundy,
                        backgroundColor: Colors.white,
                        labelStyle: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppColors.goldLight : AppColors.textCharcoal,
                        ),
                        side: BorderSide(
                          color: isSelected ? AppColors.primaryGold : AppColors.borderAmber,
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        showCheckmark: false,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // 3. NEW SAREE ARRIVALS: HORIZONTAL SCROLL ROW (2 VISIBLE + 1 PEEKS OUT)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NEW SAREE ARRIVALS',
                          style: TextStyle(
                            fontFamily: 'serif',
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.0,
                            color: AppColors.textCharcoal,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Freshly Woven Artisan Sarees Added Today',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                            color: AppColors.primaryBurgundy,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.creamBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.borderAmber, width: 0.8),
                      ),
                      child: const Row(
                        children: [
                          Text('Swipe', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                          SizedBox(width: 4),
                          Icon(Icons.swap_horiz, size: 14, color: AppColors.primaryBurgundy),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (store.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: CircularProgressIndicator(color: AppColors.primaryBurgundy),
                  ),
                )
              else
                SizedBox(
                  height: 275,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: store.products.length,
                    separatorBuilder: (context, idx) => const SizedBox(width: 12),
                    itemBuilder: (context, idx) {
                      final product = store.products[idx];
                      return SizedBox(
                        width: 160,
                        child: SareeCard(product: product),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 20),

              // 4. EDITORIAL LOOKBOOK & TRENDING SAREES GRID
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'HANDCRAFTED DRAPES',
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textCharcoal,
                      ),
                    ),
                    TextButton(
                      onPressed: () => store.selectCategory('All Sarees'),
                      child: const Text(
                        'View All →',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryBurgundy),
                      ),
                    ),
                  ],
                ),
              ),

              if (store.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: CircularProgressIndicator(color: AppColors.primaryBurgundy),
                  ),
                )
              else
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.58,
                    ),
                    itemCount: store.products.length,
                    itemBuilder: (context, idx) {
                      final product = store.products[idx];
                      return SareeCard(product: product);
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // 5. WHAT OUR ROYAL CLIENTS SAY (TESTIMONIALS CAROUSEL - ROTATES EVERY 1.5s)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.creamBg,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.borderAmber),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'REAL VERIFIED REVIEWS',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                        color: AppColors.primaryBurgundy,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'WHAT OUR ROYAL CLIENTS SAY',
                      style: TextStyle(
                        fontFamily: 'serif',
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.8,
                        color: AppColors.textCharcoal,
                      ),
                    ),
                    SizedBox(height: 12),

                    // Testimonial Card Carousel
                    _TestimonialsCarousel(),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),

      // 4. MOBILE BOTTOM NAVIGATION BAR
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.borderAmber, width: 0.8)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentBottomNavIndex,
          onTap: (idx) {
            setState(() => _currentBottomNavIndex = idx);
            if (idx == 4 && auth.isAuthenticated) {
              // Sign out option
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Atelier Account'),
                  content: Text('Signed in as ${auth.currentUser?.name}.\nWould you like to sign out?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        auth.logout();
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
                      },
                      child: const Text('Sign Out', style: TextStyle(color: AppColors.crimsonRed)),
                    ),
                  ],
                ),
              );
            } else if (idx == 4 && !auth.isAuthenticated) {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            }
          },
          backgroundColor: Colors.white,
          selectedItemColor: AppColors.primaryBurgundy,
          unselectedItemColor: AppColors.textMuted,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          type: BottomNavigationBarType.fixed,
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
            const BottomNavigationBarItem(icon: Icon(Icons.category_outlined), activeIcon: Icon(Icons.category), label: 'Shop'),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: store.wishlistCount > 0,
                label: Text('${store.wishlistCount}'),
                backgroundColor: AppColors.primaryBurgundy,
                child: const Icon(Icons.favorite_outline),
              ),
              activeIcon: const Icon(Icons.favorite),
              label: 'Wishlist',
            ),
            BottomNavigationBarItem(
              icon: Badge(
                isLabelVisible: store.cartCount > 0,
                label: Text('${store.cartCount}'),
                backgroundColor: AppColors.primaryBurgundy,
                child: const Icon(Icons.shopping_bag_outlined),
              ),
              activeIcon: const Icon(Icons.shopping_bag),
              label: 'Cart',
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline),
              activeIcon: const Icon(Icons.person),
              label: auth.isAuthenticated ? 'Account' : 'Sign In',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartView(StoreProvider store, AuthProvider auth) {
    if (store.cartCount == 0) {
      return Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  color: AppColors.creamBg,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primaryGold, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryGold.withValues(alpha: 0.15),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.shopping_bag_outlined,
                  size: 42,
                  color: AppColors.primaryBurgundy,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'YOUR SHOPPING BAG IS EMPTY',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                  color: AppColors.textCharcoal,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Your luxury shopping bag is currently empty. Explore our exquisite collection of pure silk, handcrafted Banarasi & Kanchipuram sarees tailored for timeless elegance.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 240,
                child: LuxuryButton(
                  text: 'EXPLORE SAREE CATALOG',
                  icon: Icons.arrow_forward,
                  onPressed: () {
                    setState(() => _currentBottomNavIndex = 0);
                  },
                ),
              ),
              const SizedBox(height: 36),
              // Trust Assurance Badges (Clean, Responsive, No Product Cards)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderAmber),
                ),
                child: const Column(
                  children: [
                    _AssuranceTile(
                      icon: Icons.verified_outlined,
                      title: '100% Pure Silk Mark',
                      subtitle: 'Government certified authentic handloom',
                    ),
                    Divider(color: AppColors.borderAmber, height: 16),
                    _AssuranceTile(
                      icon: Icons.local_shipping_outlined,
                      title: 'Complimentary Pan-India Delivery',
                      subtitle: 'Insured express shipping included',
                    ),
                    Divider(color: AppColors.borderAmber, height: 16),
                    _AssuranceTile(
                      icon: Icons.replay_outlined,
                      title: '7-Day Atelier Assurance',
                      subtitle: 'Hassle-free exchange policy',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final cartItems = store.cartItemsList;
    final subtotal = store.cartSubtotal;
    final tax = subtotal * 0.05;
    final total = subtotal + tax;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with count & Clear Cart
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'MY SHOPPING CART (${store.cartCount})',
                style: const TextStyle(
                  fontFamily: 'serif',
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textCharcoal,
                ),
              ),
              TextButton.icon(
                onPressed: () => store.clearCart(),
                icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.crimsonRed),
                label: const Text(
                  'Clear Cart',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.crimsonRed),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // In-Cart Delivery Address Section
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.borderAmber),
            ),
            child: Row(
              children: [
                const Icon(Icons.location_on_outlined, color: AppColors.primaryBurgundy, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Deliver To: ',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textCharcoal),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.creamBg,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: AppColors.primaryGold, width: 0.5),
                            ),
                            child: const Text('Home', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primaryBurgundy)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        auth.isAuthenticated
                            ? '${auth.currentUser?.name} • Road No. 10, Banjara Hills, Hyderabad - 500034'
                            : 'Guest Atelier Customer • Banjara Hills, Hyderabad - 500034',
                        style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Single-Row Mobile Cart Items
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: cartItems.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10),
            itemBuilder: (context, idx) {
              final entry = cartItems[idx];
              final product = entry.key;
              final qty = entry.value;

              return Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderAmber),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Saree thumbnail
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        product.images.isNotEmpty
                            ? product.images.first
                            : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
                        width: 58,
                        height: 72,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(width: 58, height: 72, color: AppColors.burgundyDark),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Details & Stepper
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product.name,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textCharcoal),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            product.category,
                            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 8),

                          // Quantity Controls
                          Row(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.creamBg,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppColors.borderAmber),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    InkWell(
                                      onTap: () => store.removeFromCart(product.id),
                                      borderRadius: BorderRadius.circular(6),
                                      child: const Padding(
                                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        child: Text('-', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 8),
                                      child: Text('$qty', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                    InkWell(
                                      onTap: () => store.addToCart(product.id),
                                      borderRadius: BorderRadius.circular(6),
                                      child: const Padding(
                                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        child: Text('+', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text('Qty', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Price & Delete
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.textMuted),
                          onPressed: () => store.deleteFromCart(product.id),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '₹${(product.price * qty).toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primaryBurgundy,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 16),

          // Total Amount Details Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderAmber),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'TOTAL AMOUNT DETAILS',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: AppColors.textCharcoal,
                  ),
                ),
                const Divider(color: AppColors.borderAmber, height: 18),
                _PriceRow(label: 'Cart Subtotal (${store.cartCount} items)', value: '₹${subtotal.toStringAsFixed(0)}'),
                const SizedBox(height: 6),
                _PriceRow(label: 'Estimated GST (5%)', value: '₹${tax.toStringAsFixed(0)}'),
                const SizedBox(height: 6),
                const _PriceRow(label: 'Express Pan-India Shipping', value: 'FREE', isHighlight: true),
                const SizedBox(height: 6),
                const _PriceRow(label: 'Luxury Box Packaging', value: 'FREE', isHighlight: true),
                const Divider(color: AppColors.borderAmber, height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Amount', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.textCharcoal)),
                    Text(
                      '₹${total.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primaryBurgundy),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                LuxuryButton(
                  text: 'PROCEED TO PLACE ORDER',
                  icon: Icons.check_circle_outline,
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.emeraldGreen,
                        content: Text('Order request placed successfully! Our concierge will contact you.'),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _AssuranceTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _AssuranceTile({required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primaryBurgundy, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textCharcoal)),
              Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
            ],
          ),
        ),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isHighlight;

  const _PriceRow({required this.label, required this.value, this.isHighlight = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        Text(
          value,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isHighlight ? AppColors.emeraldGreen : AppColors.textCharcoal,
          ),
        ),
      ],
    );
  }
}

class _TestimonialsCarousel extends StatefulWidget {
  const _TestimonialsCarousel();

  @override
  State<_TestimonialsCarousel> createState() => _TestimonialsCarouselState();
}

class _TestimonialsCarouselState extends State<_TestimonialsCarousel> {
  int _currentIndex = 0;
  Timer? _timer;

  final List<Map<String, String>> _testimonials = [
    {
      'name': 'Priya Rajvanshi',
      'location': 'HYDERABAD, INDIA',
      'review': 'The Kanchipuram pure zari saree I ordered for my wedding was breathtaking. Authentic silk weave and magnificent craftsmanship!',
    },
    {
      'name': 'Ananya Sharma',
      'location': 'MUMBAI, INDIA',
      'review': 'EVAN COLLECTIONS is the best luxury saree atelier! Fast shipping and 100% authentic handloom craftsmanship.',
    },
    {
      'name': 'Deepika Reddy',
      'location': 'BENGALURU, INDIA',
      'review': 'The Banarasi pure Katan silk drape is exquisite. The royal zari sheen and luxury box packaging felt like pure regal heritage.',
    },
    {
      'name': 'Meera Krishnan',
      'location': 'CHENNAI, INDIA',
      'review': 'Received my heirloom silk saree with official Silk Mark certification within 48 hours. The drape and rich fall are absolutely unmatched.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 1500), (timer) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % _testimonials.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final item = _testimonials[_currentIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          child: Container(
            key: ValueKey<int>(_currentIndex),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderAmber),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                    Icon(Icons.star, color: Colors.amber, size: 16),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '"${item['review']}"',
                  style: const TextStyle(
                    fontFamily: 'serif',
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                    color: AppColors.textCharcoal,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.primaryBurgundy,
                      child: Text(
                        item['name']!.substring(0, 1),
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['name']!,
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textCharcoal),
                        ),
                        Text(
                          item['location']!,
                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primaryBurgundy),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_testimonials.length, (idx) {
            final isCurrent = idx == _currentIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isCurrent ? 18 : 6,
              height: 5,
              decoration: BoxDecoration(
                color: isCurrent ? AppColors.primaryBurgundy : AppColors.borderAmber,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}
