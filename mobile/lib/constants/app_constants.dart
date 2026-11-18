import 'package:flutter/foundation.dart';

class AppConstants {
  // Brand Strings
  static const String appName = 'Aneera Silks';
  static const String atelierTagline = 'Royal Handcrafted Silk Saree Atelier';
  static const String currencySymbol = '₹';

  // Server Connectivity Configuration
  // 10.0.2.2 is the special IP that the Android emulator uses to reach host localhost:5000
  // 127.0.0.1 is used for iOS Simulator or Flutter Web
  static String get defaultBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api';
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api';
    } else {
      return 'http://127.0.0.1:5000/api';
    }
  }

  // Active Base URL (Can be overridden dynamically in app settings)
  static String baseUrl = defaultBaseUrl;

  // API Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String forgotPasswordEndpoint = '/auth/forgot-password';
  static const String userProfileEndpoint = '/auth/profile';
  static const String productsEndpoint = '/products';
  static const String categoriesEndpoint = '/categories';
  static const String cartEndpoint = '/cart';
  static const String wishlistEndpoint = '/wishlist';

  // Local Storage Preferences Keys
  static const String keyAuthToken = 'aneera_auth_token';
  static const String keyUserData = 'aneera_user_data';
  static const String keyOnboardingSeen = 'aneera_onboarding_seen';
}
