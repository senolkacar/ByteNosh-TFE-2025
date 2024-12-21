import 'package:flutter/material.dart';

class ScanQrCodeScreen extends StatefulWidget {
  @override
  State<ScanQrCodeScreen> createState() => _ScanQrCodeScreenState();
}

class _ScanQrCodeScreenState extends State<ScanQrCodeScreen> {
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
          Text('Scan QR Code',
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.black)),
        ],
      ),
      body: Text('Scan QR Code'),
    );
  }
}