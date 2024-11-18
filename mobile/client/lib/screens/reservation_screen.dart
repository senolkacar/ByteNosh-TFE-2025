import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '/constants/api_constants.dart';
import 'package:intl/intl.dart';

class ReservationScreen extends StatefulWidget {
  final String userId;

  const ReservationScreen({super.key, required this.userId});

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  Future<List<dynamic>> fetchUserReservations() async {
    final response = await http.get(Uri.parse('$baseUrl/api/reservations/all/${widget.userId}'));

    if (response.statusCode == 200) {
      List<dynamic> jsonResponse = jsonDecode(response.body)['reservations'];

      // Fetch order details for each reservation
      for (var reservation in jsonResponse) {
        if (reservation['orders'] != null) {
          List<dynamic> ordersDetails = [];
          for (String orderId in reservation['orders']) {
            final orderResponse = await http.get(Uri.parse('$baseUrl/api/orders/getOne/$orderId'));
            if (orderResponse.statusCode == 200) {
              ordersDetails.add(jsonDecode(orderResponse.body));
            } else {
              throw Exception('Failed to fetch order: $orderId');
            }
          }
          reservation['ordersDetails'] = ordersDetails; // Add detailed order data to reservation
        }
      }

      return jsonResponse;
    } else {
      throw Exception('Failed to load reservations');
    }
  }

  void _navigateToMakeReservation(BuildContext context) {
    // Navigate to the screen where the user can create a new reservation.
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MakeReservationScreen(), // Replace with your actual screen
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'My Reservations',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: fetchUserReservations(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(child: Text('No reservations found'));
                } else {
                  final reservations = snapshot.data!;
                  return ListView.builder(
                    padding: EdgeInsets.all(16.0),
                    itemCount: reservations.length,
                    itemBuilder: (context, index) {
                      final reservation = reservations[index];
                      final formattedDate = DateFormat('dd/MM/yyyy').format(DateTime.parse(reservation['reservationTime']));

                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        elevation: 5,
                        margin: EdgeInsets.only(bottom: 16.0),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.table_restaurant, color: Colors.pink[900]),
                                  SizedBox(width: 8),
                                  Text(
                                    'Table: ${reservation['table']['name']}',
                                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.place, color: Colors.blueGrey),
                                  SizedBox(width: 8),
                                  Text(
                                    'Section: ${reservation['section']['name']}',
                                    style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today, color: Colors.blueGrey),
                                  SizedBox(width: 8),
                                  Text(
                                    'Date: $formattedDate',
                                    style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.people, color: Colors.blueGrey),
                                  SizedBox(width: 8),
                                  Text(
                                    'Guests: ${reservation['guests']}',
                                    style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.access_time, color: Colors.blueGrey),
                                  SizedBox(width: 8),
                                  Text(
                                    'Time Slot: ${reservation['timeSlot']}',
                                    style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                  ),
                                ],
                              ),
                              SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.info, color: Colors.blueGrey),
                                  SizedBox(width: 8),
                                  Text(
                                    'Status: ${reservation['status']}',
                                    style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                  ),
                                ],
                              ),
                              SizedBox(height: 16),
                              Text(
                                'Orders:',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.pink[900]),
                              ),
                              if (reservation.containsKey('ordersDetails') && reservation['ordersDetails'].isNotEmpty)
                                for (var order in reservation['ordersDetails'])
                                  Padding(
                                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Icon(Icons.fastfood, color: Colors.blueGrey),
                                            SizedBox(width: 8),
                                            Expanded(
                                              child: Text(
                                                'Meals: ${order['meals'].map((meal) => meal['name']).join(', ')}',
                                                style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                                overflow: TextOverflow.ellipsis,
                                                maxLines: 2,
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(height: 4),
                                        Row(
                                          children: [
                                            Icon(Icons.info_outline, color: Colors.blueGrey),
                                            SizedBox(width: 8),
                                            Expanded(
                                              child: Text(
                                                'Order Status: ${order['status']}',
                                                style: TextStyle(fontSize: 16, color: Colors.blueGrey),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                              SizedBox(height: 16),
                              Align(
                                alignment: Alignment.bottomRight,
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    backgroundColor: Colors.pink[900],
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  onPressed: () {
                                    // Placeholder for sharing or using the QR code URL
                                  },
                                  icon: Icon(Icons.qr_code),
                                  label: Text('Show QR Code'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                }
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
                foregroundColor: Colors.white,
                backgroundColor: Colors.pink[900],
              ),
              onPressed: () => _navigateToMakeReservation(context),
              child: Text('Make a New Reservation'),
            ),
          ),
        ],
      ),
    );
  }
}

class MakeReservationScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Make a New Reservation"),
      ),
      body: Center(
        child: Text("Reservation creation form here"),
      ),
    );
  }
}
