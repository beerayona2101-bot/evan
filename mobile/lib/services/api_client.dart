import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  final Duration _timeout = const Duration(seconds: 10);

  Future<Map<String, String>> _getHeaders({bool requireAuth = false}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requireAuth) {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.keyAuthToken);
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Uri _buildUri(String endpoint, [Map<String, dynamic>? queryParameters]) {
    final cleanBase = AppConstants.baseUrl.endsWith('/')
        ? AppConstants.baseUrl.substring(0, AppConstants.baseUrl.length - 1)
        : AppConstants.baseUrl;
    final cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    final fullUrl = '$cleanBase$cleanEndpoint';

    if (queryParameters != null && queryParameters.isNotEmpty) {
      final query = queryParameters.map((k, v) => MapEntry(k, v.toString()));
      return Uri.parse(fullUrl).replace(queryParameters: query);
    }
    return Uri.parse(fullUrl);
  }

  // GET Request
  Future<dynamic> get(String endpoint, {Map<String, dynamic>? queryParameters, bool requireAuth = false}) async {
    try {
      final uri = _buildUri(endpoint, queryParameters);
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http.get(uri, headers: headers).timeout(_timeout);
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Cannot reach Aneera Silks server. Please check your internet or server IP.');
    } on http.ClientException {
      throw ApiException('Network connection failed. Please ensure the backend server is running.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  // POST Request
  Future<dynamic> post(String endpoint, {Map<String, dynamic>? body, bool requireAuth = false}) async {
    try {
      final uri = _buildUri(endpoint);
      final headers = await _getHeaders(requireAuth: requireAuth);
      final response = await http
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _processResponse(response);
    } on SocketException {
      throw ApiException('Cannot reach Aneera Silks server. Please check your connection.');
    } on http.ClientException {
      throw ApiException('Failed to connect to backend server. Please verify server status.');
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Unexpected network error: $e');
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      jsonBody = jsonDecode(response.body);
    } catch (_) {
      jsonBody = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    }

    String errorMessage = 'Server error occurred (${response.statusCode})';
    if (jsonBody is Map && jsonBody.containsKey('message')) {
      errorMessage = jsonBody['message'].toString();
    } else if (jsonBody is String && jsonBody.isNotEmpty) {
      errorMessage = jsonBody;
    }

    throw ApiException(errorMessage, statusCode: response.statusCode);
  }
}
