import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'login_screen.dart';
import '../constants/api_constants.dart';
import '../services/api_service.dart';

final storage = FlutterSecureStorage();

class ProfileScreen extends StatefulWidget {
  final String userEmail;

  const ProfileScreen({Key? key, required this.userEmail}) : super(key: key);

  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late String fullName = '';
  late String avatar = '';
  late TextEditingController emailController;
  late TextEditingController phoneController;

  @override
  void initState() {
    super.initState();
    emailController = TextEditingController();
    phoneController = TextEditingController();
    fetchUserProfile();
  }

  Future<void> fetchUserProfile() async {
    try {
      final response = await ApiService.apiRequest('/api/users/${widget.userEmail}', context: context);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          fullName = data['fullName'];
          avatar = data['avatar'];
        });
        // Update controllers
        emailController.text = data['email'];
        phoneController.text = data['phone'];
      } else {
        throw Exception('Failed to load profile');
      }
    } catch (error) {
      if (kDebugMode) {
        print('Error fetching user: $error');
      }
    }
  }

  void handleImageUpload(File file) async {
    try {
      final Uri apiUrl = Uri.parse('/api/upload');
      final request = http.MultipartRequest('POST', apiUrl)
        ..files.add(await http.MultipartFile.fromPath('image', file.path));

      final response = await http.Response.fromStream(await request.send());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          avatar = data['filename'];
        });
      } else {
        throw Exception('Failed to upload image');
      }
    } catch (error) {
      if (kDebugMode) {
        print('Error uploading image: $error');
      }
    }
  }

  void updateProfile() async {
    try {
      final response = await ApiService.apiRequest(
        '/api/users',
        method: 'POST',
        context: context,
        data: {
          'fullName': fullName,
          'email': emailController.text,
          'avatar': avatar,
          'phone': phoneController.text,
        },
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Profile updated successfully')));
      } else {
        throw Exception('Failed to update profile');
      }
    } catch (error) {
      if (kDebugMode) {
        print('Error updating profile: $error');
      }
    }
  }

  @override
  void dispose() {
    emailController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CircleAvatar(
              radius: 50,
              backgroundImage: avatar.isNotEmpty
                  ? NetworkImage('$baseUrl/images/$avatar') as ImageProvider
                  : AssetImage('assets/images/account-default.png'),
              child: avatar.isEmpty ? Icon(Icons.person) : null,
            ),
            SizedBox(height: 20),
            Text(
              fullName,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            TextFormField(
              controller: emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            SizedBox(height: 20),
            TextFormField(
              controller: phoneController,
              decoration: InputDecoration(labelText: 'Phone Number'),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: updateProfile,
              child: Text('Save Changes'),
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

  void logout(BuildContext context) async {
    await storage.delete(key: 'accessToken@');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }
}
