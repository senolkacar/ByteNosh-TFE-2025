import 'package:flutter/material.dart';
import 'package:client/screens/login_screen.dart';
import 'package:client/screens/homepage_screen.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '/constants/api_constants.dart';

void main() {
  runApp(const MobileApp());
}

class MobileApp extends StatelessWidget {
  const MobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        primarySwatch: Colors.pink,
        fontFamily: 'Rubik',
      ),
      home: AuthCheckScreen(),
    );
  }
}

class AuthCheckScreen extends StatefulWidget {
  @override
  State<AuthCheckScreen> createState() => _AuthCheckScreenState();
}

class _AuthCheckScreenState extends State<AuthCheckScreen> {
  final storage = FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    String? token = await storage.read(key: 'user_token');

    if (token != null) {
      // Validate token with the backend
      final response = await http.get(
        Uri.parse('$baseUrl/api/auth/validate'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final userData = jsonDecode(response.body);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => HomepageScreen(
              userEmail: userData['email'],
              userData: userData,
            ),
          ),
        );
      } else {
        // Token is invalid or expired
        await storage.delete(key: 'user_token');
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => LoginScreen()),
        );
      }
    } else {
      // No token found
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
