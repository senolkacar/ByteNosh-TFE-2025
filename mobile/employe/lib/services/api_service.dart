import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '/constants/api_constants.dart';
import 'package:flutter/material.dart';
import 'package:device_info_plus/device_info_plus.dart';
import '/screens/login_screen.dart';

class ApiService {
  static final storage = FlutterSecureStorage();
  static String? accessToken;
  static String? refreshToken;

  // Initialize tokens from secure storage
  static Future<void> initializeTokens() async {
    accessToken = await storage.read(key: 'accessToken');
    refreshToken = await storage.read(key: 'refreshToken');
  }

  // Save access and refresh tokens
  static Future<void> saveTokens(String newAccessToken, String newRefreshToken) async {
    accessToken = newAccessToken;
    refreshToken = newRefreshToken;

    await storage.write(key: 'accessToken', value: accessToken);
    await storage.write(key: 'refreshToken', value: refreshToken);
  }

  // Clear secure storage
  static Future<void> clearStorage() async {
    accessToken = null;
    refreshToken = null;
    await storage.deleteAll();
  }

  // Get device information for refresh token requests
  static Future<String> _getDeviceInfo() async {
    final deviceInfo = DeviceInfoPlugin();
    final androidInfo = await deviceInfo.androidInfo;
    return "${androidInfo.manufacturer}-${androidInfo.model}";
  }

  // Refresh the token using the backend
  static Future<void> refreshTokenIfNeeded(BuildContext context) async {
    if (refreshToken == null) {
      _handleSessionExpired(context, 'Refresh token is missing');
      return;
    }

    final deviceInfo = await _getDeviceInfo();

    final response = await http.post(
      Uri.parse('$baseUrl/api/auth-backend/refresh-token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'refreshToken': refreshToken,
        'deviceInfo': deviceInfo,
      }),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> responseData = jsonDecode(response.body);
      final newAccessToken = responseData['accessToken'];
      final newRefreshToken = responseData['refreshToken'];

      if (newAccessToken != null && newRefreshToken != null) {
        await saveTokens(newAccessToken, newRefreshToken);
      } else {
        _handleSessionExpired(context, 'Failed to refresh tokens');
      }
    } else if (response.statusCode == 403) {
      _handleSessionExpired(context, 'Session expired. Please log in again.');
    } else {
      throw Exception('Failed to refresh token');
    }
  }

  // Handle API requests with automatic token refresh
  static Future<http.Response> apiRequest(String endpoint,
      {String method = 'GET', Map<String, dynamic>? data, required BuildContext context}) async {
    if (accessToken == null) {
      _handleSessionExpired(context, 'Access token is missing');
      throw Exception("Access token is missing");
    }

    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Authorization': 'Bearer $accessToken',
      'Content-Type': 'application/json'
    };

    http.Response response;

    try {
      response = await _makeHttpRequest(method, url, headers, data);
    } catch (e) {
      throw Exception("Network error: $e");
    }

    if (response.statusCode == 401) {
      try {
        await refreshTokenIfNeeded(context);

        if (accessToken == null) {
          _handleSessionExpired(context, 'Refresh failed');
          throw Exception("Refresh failed");
        }

        headers['Authorization'] = 'Bearer $accessToken';
        response = await _makeHttpRequest(method, url, headers, data);
      } catch (e) {
        throw Exception('Failed to refresh token');
      }
    }

    return response;
  }

  static void _handleSessionExpired(BuildContext context, String message) {
    clearStorage();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => LoginScreen()),
      (Route<dynamic> route) => false,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  static Future<http.Response> _makeHttpRequest(String method, Uri url, Map<String, String> headers, Map<String, dynamic>? data) async {
    switch (method) {
      case 'POST':
        return await http.post(url, headers: headers, body: jsonEncode(data));
      case 'PUT':
        return await http.put(url, headers: headers, body: jsonEncode(data));
      case 'DELETE':
        return await http.delete(url, headers: headers, body: jsonEncode(data));
      case 'GET':
      default:
        return await http.get(url, headers: headers);
    }
  }
}