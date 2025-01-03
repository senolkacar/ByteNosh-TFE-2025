import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '/services/api_service.dart';
import 'dart:async';
import 'package:lottie/lottie.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class RequestPayment extends StatefulWidget {
  final String tableId;

  RequestPayment({required this.tableId});

  @override
  State<RequestPayment> createState() => _RequestPaymentState();
}

class _RequestPaymentState extends State<RequestPayment> {
  String? qrCodeUrl;
  bool isLoading = true;
  String? errorMessage;
  String? amount;
  String? paymentIdentifier;
  bool isPaymentSuccessful = false;
  late IO.Socket socket;

  @override
  void initState() {
    super.initState();
    _initializeSocketIO();
    _requestPayment();
  }

  @override
  void dispose() {
    socket.dispose();
    super.dispose();
  }

  void _initializeSocketIO() {
    socket = IO.io(
      'https://www.senolkacar.be',
      IO.OptionBuilder()
          .setTransports(['websocket']) // Use WebSocket only
          .disableAutoConnect() // Disable auto-connect to configure before connecting
          .build(),
    );

    // Connect to the server
    socket.connect();

    // Listen for connection events
    socket.onConnect((_) {
      if (kDebugMode) {
        print('Connected to WebSocket');
      }
    });

    // Listen for disconnection events
    socket.onDisconnect((_) {
      if (kDebugMode) {
        print('Disconnected from WebSocket');
      }
    });

    // Listen for payment status updates
    socket.on('payment-status-updated', (data) {
      if (data['paymentIdentifier'] == paymentIdentifier) {
        if (data['paymentStatus'] == 'PAID') {
          setState(() {
            isPaymentSuccessful = true;
          });
        } else if (data['paymentStatus'] == 'FAILED') {
          setState(() {
            errorMessage = 'Payment failed. Please try again.';
          });
        }
      }
    });

    // Handle errors
    socket.onError((error) {
      print('WebSocket Error: $error');
    });

    socket.onReconnect((attempt) {
      print('Reconnected after $attempt attempts');
    });
  }

  Future<void> _requestPayment() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
      isPaymentSuccessful = false;
    });
    try {
      final response = await ApiService.apiRequest(
        '/api/payment/generate-payment-qr/${widget.tableId}',
        context: context,
        method: 'POST',
        data: {},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        setState(() {
          qrCodeUrl = data['qrCode'];
          amount = data['totalAmount'].toString();
          paymentIdentifier = data['paymentIdentifier'];
          isLoading = false;
        });
      } else {
        setState(() {
          errorMessage = 'Failed to generate payment QR code';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Error: ${e.toString()}';
        isLoading = false;
      });
    }
  }

  Widget _buildLoading() {
    return Center(
      child: CircularProgressIndicator(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Lottie.asset('assets/error.json', width: 200, repeat: false, animate: true),
          SizedBox(height: 16),
          Text(
            errorMessage ?? 'An error occurred',
            style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildSuccess() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Lottie.asset('assets/success.json', width: 200, repeat: false, animate: true),
          SizedBox(height: 16),
          Text(
            'Payment Successful!',
            style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildQRDisplay() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Center(
          child: Text(
            'Total Amount: ${double.parse(amount!).toStringAsFixed(2)} €',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 30),
          ),
        ),
        Text('Scan the QR Code to Pay', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
        SizedBox(height: 30),
        qrCodeUrl != null
            ? Image.memory(
          base64Decode(qrCodeUrl!.split(',').last),
          fit: BoxFit.contain,
          width: 300,
          height: 300,
          errorBuilder: (context, error, stackTrace) {
            return Text(
              'Failed to load QR Code',
              style: TextStyle(color: Colors.red),
            );
          },
        )
            : Text('No QR Code available'),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Request Payment', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: isLoading
          ? _buildLoading()
          : errorMessage != null
          ? _buildError()
          : isPaymentSuccessful
          ? _buildSuccess()
          : SingleChildScrollView(
        child: _buildQRDisplay(),
      ),
    );
  }
}