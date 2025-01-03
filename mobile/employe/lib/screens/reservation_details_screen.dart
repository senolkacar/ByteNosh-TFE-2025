import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '/screens/homepage_screen.dart';

class ReservationDetailsScreen extends StatelessWidget {
  final Map<String, dynamic> reservationDetails;

  ReservationDetailsScreen({required this.reservationDetails});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'Reservation Details',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView( // Allow scrolling if content exceeds screen
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Reservation Details Card
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Reservation Details', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    SizedBox(height: 16),
                    _buildDetailRow('Table', reservationDetails['table']['name']),
                    _buildDetailRow('Section', reservationDetails['section']['name']),
                    _buildDetailRow('Guests', reservationDetails['guests'].toString()),
                    _buildDetailRow('Reservation Time', DateFormat('dd/MM/yyyy').format(DateTime.parse(reservationDetails['reservationTime']))),
                    _buildDetailRow('Time Slot', reservationDetails['timeSlot']),
                    _buildDetailRow('Status', reservationDetails['status']),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            // Additional Information (Optional)
            // You can add more cards or sections here for additional info
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
         Navigator.pop(context);
        },
        child: Icon(Icons.home, color: Colors.white),
        backgroundColor: Colors.pink[900],
      ),
    );
  }

  // Helper function to build detail rows
  Widget _buildDetailRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Text('$title: ', style: TextStyle(fontWeight: FontWeight.bold)),
          Text(value),
        ],
      ),
    );
  }
}