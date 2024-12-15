import 'dart:convert';
import 'package:client/screens/homepage_screen.dart';
import 'package:flutter/material.dart';
import 'package:client/components/input_field.dart';
import 'package:client/components/login_button.dart';
import 'package:http/http.dart' as http;
import '/constants/api_constants.dart';
import 'package:client/services/api_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> signUserIn() async {
    if (_formKey.currentState == null || !_formKey.currentState!.validate()) {
      return;
    }

    final email = emailController.text;
    final password = passwordController.text;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth-backend/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final accessToken = responseData['accessToken'];
        final refreshToken = responseData['refreshToken'];

        if (accessToken != null && refreshToken != null) {
          // Wait for the tokens to be fully saved
          await ApiService.saveTokens(accessToken, refreshToken);

          // Navigate only after the tokens are saved
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => HomepageScreen(
                userEmail: email,
                userData: responseData['user'],
              ),
            ),
          );
        } else {
          showError('Login failed: Missing tokens');
        }
      } else {
        showError('Login failed: ${response.body}');
      }
    } catch (e) {
      showError('An error occurred: $e');
    }
  }


  void showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 50),
                  Text(
                    'ByteNosh',
                    style: TextStyle(
                      color: Colors.pink[900],
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 25),
                  InputField(
                    controller: emailController,
                    hintText: 'Email',
                    validator: validateEmail,
                  ),
                  const SizedBox(height: 10),
                  InputField(
                    controller: passwordController,
                    hintText: 'Password',
                    obscureText: true,
                    isPassword: true,
                    validator: validatePassword,
                  ),
                  const SizedBox(height: 25),
                  LoginButton(onTap: signUserIn),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text('Not a member?'),
                      SizedBox(width: 4),
                      Text(
                        'Register now',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter an email';
    }
    final RegExp emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email';
    }
    return null;
  }

  String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter a password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  }
}
