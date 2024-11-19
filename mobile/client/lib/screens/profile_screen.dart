import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'login_screen.dart';

final storage = FlutterSecureStorage();

class ProfileScreen extends StatelessWidget {
  final String userEmail;
  const ProfileScreen({super.key, required this.userEmail});

  void logout(BuildContext context) async {
    await storage.delete(key: 'user_token');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 50,
              child: Icon(Icons.person),
            ),
            SizedBox(height: 20),
            Text(
              userEmail,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => logout(context),
              child: Text('Log Out'),
            ),
          ],
        ),
      ),
    );
  }
}
