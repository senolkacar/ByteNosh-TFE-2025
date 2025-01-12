import 'package:employe/screens/profile_screen.dart';
import 'package:employe/screens/take_order_screen.dart';
import 'package:flutter/material.dart';
import '/screens/scan_qr_code_screen.dart';

class HomepageScreen extends StatefulWidget {
  final String userEmail;
  final Map<String, dynamic> userData;

  const HomepageScreen({super.key, required this.userEmail, required this.userData});

  @override
  State<HomepageScreen> createState() => _HomepageScreenState();
}

class _HomepageScreenState extends State<HomepageScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'ByteNosh',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          Text('Welcome, '),
          Text(widget.userEmail,
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.black)),
        ],
      ),
      body: TakeOrderScreen(),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Take Order',
          ),
          BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_scanner),
              label: 'Scan QR Code',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        onTap: (index) {
          switch (index) {
            case 0:
              break;
            case 1:
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ScanQrCodeScreen(),
                ),
              );
              break;
              case 2:
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProfileScreen(userEmail: widget.userEmail),
                  ),
                );
          }
        },
      ),
    );
  }
}
