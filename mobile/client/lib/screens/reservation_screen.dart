import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:client/services/api_service.dart';
import 'package:client/screens/make_reservation_screen.dart';

final storage = FlutterSecureStorage();

class ReservationScreen extends StatefulWidget {
  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen>
    with SingleTickerProviderStateMixin {
  String? _userId;
  String? _accessToken;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    try {
      final token = await storage.read(key: 'accessToken');
      if (token != null) {
        setState(() {
          _accessToken = token;
          Map<String, dynamic> decodedToken = Jwt.parseJwt(token);
          _userId = decodedToken['id'];
        });
      }
    } catch (error) {
      if (kDebugMode) {
        print('Error loading user data: $error');
      }
    }
  }

  Future<List<dynamic>> fetchUserReservations() async {
    try {
      final response = await ApiService.apiRequest('/api/reservations/all', context: context);

      if (response.statusCode == 200) {
        List<dynamic> jsonResponse = jsonDecode(response.body)['reservations'];

        for (var reservation in jsonResponse) {
          if (reservation['orders'] != null) {
            List<dynamic> ordersDetails = [];
            for (String orderId in reservation['orders']) {
              final orderResponse = await ApiService.apiRequest('/api/orders/getOne/$orderId', context: context);
              if (orderResponse.statusCode == 200) {
                ordersDetails.add(jsonDecode(orderResponse.body));
              }
            }
            reservation['ordersDetails'] = ordersDetails;
          }
        }

        return jsonResponse;
      } else {
        throw Exception('Failed to load reservations');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  Future<void> _cancelReservation(String reservationId) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await ApiService.apiRequest(
        '/api/reservations/$reservationId/cancel',
        data: {},
        method: 'PUT',
        context: context,
      );

      Navigator.pop(context); // Close loading indicator

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Reservation canceled successfully!',
              style: TextStyle(color: Colors.white),
            ),
            backgroundColor: Colors.green,
          ),
        );

        setState(() {}); // Refresh the reservations list
      } else {
        if (kDebugMode) {
          print('Response: ${response.body}');
        }
        throw Exception('Failed to cancel reservation with reservation id: $reservationId');
      }
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showCancellationDialog(BuildContext context, String reservationId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Reservation'),
        content: const Text(
          'Are you sure you want to cancel this reservation? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () {
              Navigator.pop(context);
              _cancelReservation(reservationId);
            },
            child: const Text('Yes', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showQRCodeDialog(BuildContext context, String qrCodeBase64) {
    // Extract Base64 data by removing the "data:image/png;base64," prefix
    final base64Data = qrCodeBase64.split(',').last;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Reservation QR Code',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              SizedBox(height: 16),
              Image.memory(
                base64Decode(base64Data),
                fit: BoxFit.contain,
                width: 200,
                height: 200,
                errorBuilder: (context, error, stackTrace) {
                  return Text(
                    'Failed to load QR Code',
                    style: TextStyle(color: Colors.red),
                  );
                },
              ),
              SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'Close',
                  style: TextStyle(color: Colors.pink[900]),
                ),
              ),
            ],
          ),
        );
      },
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
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.pink[900],
          tabs: const [
            Tab(text: 'Upcoming'),
            Tab(text: 'Past'),
          ],
        ),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: FutureBuilder<List<dynamic>>(
              future: fetchUserReservations(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No reservations found'));
                } else {
                  final now = DateTime.now();
                  final reservations = snapshot.data!;

                  final upcomingReservations = reservations.where((res) {
                    final reservationDate = DateTime.parse(res['reservationTime']);
                    return reservationDate.isAfter(now) && res['status'] != 'CANCELLED';
                  }).toList();

                  final pastReservations = reservations.where((res) {
                    final reservationDate = DateTime.parse(res['reservationTime']);
                    return reservationDate.isBefore(now) || res['status'] == 'CANCELLED';
                  }).toList();

                  return TabBarView(
                    controller: _tabController,
                    children: [
                      _buildReservationList(upcomingReservations, true),
                      _buildReservationList(pastReservations, false),
                    ],
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

  Widget _buildReservationList(List<dynamic> reservations, bool isUpcoming) {
    if (reservations.isEmpty) {
      return Center(
        child: Text(
          isUpcoming ? 'No upcoming reservations' : 'No past reservations',
          style: const TextStyle(fontSize: 16),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: reservations.length,
      itemBuilder: (context, index) {
        final reservation = reservations[index];
        final formattedDate = DateFormat('dd/MM/yyyy').format(DateTime.parse(reservation['reservationTime']));

        return Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          elevation: 5,
          margin: const EdgeInsets.only(bottom: 16.0),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.table_restaurant, color: Colors.pink[900]),
                    const SizedBox(width: 8),
                    Text(
                      'Table: ${reservation['table']['name']}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _buildReservationDetail(Icons.place, 'Section', reservation['section']['name']),
                _buildReservationDetail(Icons.calendar_today, 'Date', formattedDate),
                _buildReservationDetail(Icons.people, 'Guests', '${reservation['guests']}'),
                _buildReservationDetail(Icons.access_time, 'Time Slot', reservation['timeSlot']),
                _buildReservationDetail(Icons.info, 'Status', reservation['status']),
                const SizedBox(height: 16),
                if (reservation['ordersDetails'] != null)
                  _buildOrders(reservation['ordersDetails']),
                if (isUpcoming)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          foregroundColor: Colors.white,
                          backgroundColor: Colors.pink[900],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () => _showQRCodeDialog(context, reservation['qrCodeUrl']),
                        icon: const Icon(Icons.qr_code),
                        label: const Text('Show QR Code'),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          foregroundColor: Colors.white,
                          backgroundColor: Colors.red,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () =>
                            _showCancellationDialog(context, reservation['_id']),
                        icon: const Icon(Icons.cancel),
                        label: const Text('Cancel'),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildReservationDetail(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, color: Colors.blueGrey),
          const SizedBox(width: 8),
          Text(
            '$label: $value',
            style: const TextStyle(fontSize: 16, color: Colors.blueGrey),
          ),
        ],
      ),
    );
  }

  Widget _buildOrders(List<dynamic> orders) {
    return Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: orders.map((order) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
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
    );
  }).toList(),

);
  }
}

void _navigateToMakeReservation(BuildContext context) {
  // Navigate to the screen where the user can create a new reservation.
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => MakeReservationScreen(),
    ),
  );
}