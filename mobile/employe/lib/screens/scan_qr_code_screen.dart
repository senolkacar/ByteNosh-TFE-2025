import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '/services/api_service.dart';
import 'reservation_details_screen.dart';

class ScanQrCodeScreen extends StatefulWidget {
  @override
  State<ScanQrCodeScreen> createState() => _ScanQrCodeScreenState();
}

class _ScanQrCodeScreenState extends State<ScanQrCodeScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  final FlutterSecureStorage _storage = FlutterSecureStorage();
  bool _isProcessing = false;
  String? _lastScannedCode; // Store the last scanned code

  Future<void> _scanQrCode(String encryptedData) async {
    if (_isProcessing || encryptedData == _lastScannedCode) return; // Ignore if processing or code is the same as the last one
    setState(() {
      _isProcessing = true;
      _lastScannedCode = encryptedData;
    });

    try {
      // Make API call to decrypt QR code
      final response = await ApiService.apiRequest(
        '/api/reservations/scan-qr',
        context: context,
        method: 'POST',
        data: {'qrData': encryptedData},
      );

      if (response.statusCode == 200) {
        final reservationDetails = jsonDecode(response.body)['reservation'];
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ReservationDetailsScreen(reservationDetails: reservationDetails),
          ),
        );
      } else {
        _showErrorDialog('Invalid QR Code: ${response.body}');
      }
    } catch (e) {
      _showErrorDialog('Error scanning QR code: $e');
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'Please Scan the QR Code',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: _scannerController,
              onDetect: (capture) {
                final List<Barcode> barcodes = capture.barcodes;
                if (barcodes.isNotEmpty) {
                  final barcode = barcodes.first;
                  if (barcode.rawValue != null) {
                    _scanQrCode(barcode.rawValue!);
                  }
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }
}