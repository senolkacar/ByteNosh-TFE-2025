import 'package:flutter/material.dart';
import 'package:client/screens/main_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[900],
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('ByteNosh', style: TextStyle(fontSize: 40, color: Color(0xff880e4f), fontWeight: FontWeight.bold)),
            const Text('Welcome to the Tablet Client', style: TextStyle(fontSize: 20, color: Colors.white)),
           Text('Scan the QR code to retrieve your account or click on continue without login button', style: TextStyle(fontSize: 20, color: Colors.white)),
            const SizedBox(height: 20),
           Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: [
                        Image.asset('assets/qrcode.png', width: 200, height: 200),
                        const SizedBox(height: 10),
                        Text('Scan QR Code', style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Container(
                  height: 250,
                    child: const VerticalDivider(color: Colors.white, thickness: 1, width: 20)),
                const SizedBox(width: 20),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => MainScreen()),
                        );
                      },
                      child: Column(
                        children: [
                          Icon(Icons.login, size: 200, color: Colors.blueGrey[900]),
                          const SizedBox(height: 10),
                          Text('Continue without login', style: TextStyle(fontSize: 20,fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
           ),
          ],
        ),
      ),
    );
  }
}
