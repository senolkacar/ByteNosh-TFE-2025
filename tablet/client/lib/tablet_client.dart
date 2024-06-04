import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const TabletClientApp());
}

class TabletClientApp extends StatelessWidget {
  const TabletClientApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
    home: LoginScreen(),
    );
  }
}