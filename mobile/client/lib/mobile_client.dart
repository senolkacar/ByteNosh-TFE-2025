import 'package:flutter/material.dart';
import 'package:client/screens/login_screen.dart';

void main() {
  runApp(const MobileApp());
}

class MobileApp extends StatelessWidget {
  const MobileApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        primarySwatch: Colors.pink,
        fontFamily: 'Rubik',
      ),
      home: LoginScreen(),
    );
  }
}


