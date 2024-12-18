import 'package:flutter/material.dart';
import '/services/api_service.dart';
import '/screens/login_screen.dart';
import '/screens/homepage_screen.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'dart:convert';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.initializeTokens();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      locale: const Locale('fr', 'BE'),
      supportedLocales: const [
        Locale('en', 'US'), // English (US)
        Locale('fr', 'FR'), // French (France)
        Locale('fr', 'BE'), // French (Belgium)
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
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
  @override
  void initState() {
    super.initState();
    checkLoginStatus();
  }

  Future<void> checkLoginStatus() async {
    if (ApiService.accessToken == null || ApiService.refreshToken == null) {
      logout(); // No tokens found, navigate to login
      return;
    }

    try {
      final response = await ApiService.apiRequest('/api/auth-backend/validate', context: context);

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
        logout();
      }
    } catch (e) {
      logout();
    }
  }

  void logout() async {
    await ApiService.clearStorage();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
