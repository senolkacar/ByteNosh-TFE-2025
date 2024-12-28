import 'dart:convert';
import 'package:flutter/material.dart';
import '/models/table.dart';
import '/services/api_service.dart';
import 'package:intl/intl.dart';
import '/screens/edit_order_screen.dart';

class ViewOrderScreen extends StatefulWidget {
  final TableInfo table;

  ViewOrderScreen({required this.table});

  @override
  _ViewOrderScreenState createState() => _ViewOrderScreenState();
}

class _ViewOrderScreenState extends State<ViewOrderScreen> {
  late TableInfo table;
  List<Map<String, dynamic>> _orders = [];
  bool _loadingOrders = true;

  @override
  void initState() {
    super.initState();
    table = widget.table;
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() {
      _loadingOrders = true;
    });
    try {
      final response = await ApiService.apiRequest(
        '/api/orders/table/${table.id}',
        context: context,
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final List<dynamic> orders = jsonDecode(response.body);
        setState(() {
          _orders = orders.map((dynamic order) {
            final meals = (order['meals'] as List<dynamic>? ?? []).map((meal) {
              if (meal != null && meal is Map<String, dynamic>) {
                final mealDetails = meal['meal'] as Map<String, dynamic>?;
                return {
                  '_id': mealDetails?['_id'] ?? '',
                  'name': mealDetails?['name'] ?? 'Unnamed',
                  'description': mealDetails?['description'] ?? 'No description',
                  'price': mealDetails?['price'] ?? 0.0,
                  'quantity': meal['quantity'] ?? 1,
                };
              }
              return null;
            }).whereType<Map<String, dynamic>>().toList();

            return {
              '_id': order['_id'] ?? '',
              'table': order['table'] ?? '',
              'meals': meals,
              'user': order['user'],
              'status': order['status'] ?? 'Unknown',
              'reservation': order['reservation'],
              'notes': order['notes'] ?? '',
              'createdAt': order['createdAt'] ?? '',
            };
          }).toList();
        });
      } else {
        throw Exception('Failed to load orders');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _loadingOrders = false;
      });
    }
  }

  Future<void> _deleteOrder(String orderId) async {
    final response = await ApiService.apiRequest(
      '/api/orders/$orderId',
      context: context,
      method: 'DELETE',
      data: {},
    );

    if (response.statusCode == 200) {
      setState(() {
        _orders.removeWhere((order) => order['_id'] == orderId);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order successfully deleted')),
      );
    } else {
      print(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete order')),
      );
    }
  }

  Future<void> _updateOrderStatus(String orderId, String status) async {
    final response = await ApiService.apiRequest(
      '/api/orders/$orderId',
      context: context,
      method: 'PATCH',
      data: {'status': status},
    );

    if (response.statusCode == 200) {
      setState(() {
        final order = _orders.firstWhere((order) => order['_id'] == orderId);
        order['status'] = status;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order status updated to $status')),
      );
    } else {
      print(response.body);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update order status')),
      );
    }
  }

  void _editOrder(Map<String, dynamic> order) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditOrderScreen(order: order),
      ),
    ).then((value) {
      if (value == true) {
        _fetchOrders();
      }
    });
  }

  double _calculateTotal(List<Map<String, dynamic>> meals) {
    return meals.fold(0.0, (total, meal) => total + (meal['price'] * meal['quantity']));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.white,
        backgroundColor: Colors.pink[900],
        title: Text('Table ${table.number} Orders', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: _loadingOrders
          ? Center(child: CircularProgressIndicator())
          : _orders.isEmpty
          ? Center(child: Text('No orders found for this table.'))
          : ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: _orders.length,
        itemBuilder: (context, index) {
          final order = _orders[index];
          final total = _calculateTotal(order['meals']);

          return Card(
            elevation: 6,
            margin: EdgeInsets.only(bottom: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Align(
                    alignment: Alignment.centerRight,
                    child: IconButton(
                      icon: Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteOrder(order['_id']),
                    ),
                  ),
                  Text(
                    'Order ID: ${order['_id']}',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Colors.pink[900],
                    ),
                  ),
                  SizedBox(height: 8),
                  Text('Status: ${order['status'] ?? 'Unknown'}', style: TextStyle(color: Colors.grey[700])),
                  SizedBox(height: 8),
                  Text('Date: ${order['createdAt'] != null ? DateFormat('dd/MM/yyyy').format(DateTime.parse(order['createdAt']).toLocal()) : 'N/A'}', style: TextStyle(color: Colors.grey[700])),
                  SizedBox(height: 8),
                  Text('Notes: ${order['notes'] ?? 'No notes'}', style: TextStyle(color: Colors.grey[700])),
                  SizedBox(height: 8),
                  Text('Meals:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Column(
                    children: (order['meals'] as List<Map<String, dynamic>>).map((meal) {
                      return ListTile(
                        title: Text(meal['name'], style: TextStyle(fontSize: 16)),
                        subtitle: Text('Price: ${meal['price'].toStringAsFixed(2)} €', style: TextStyle(color: Colors.grey[600])),
                        trailing: Text('Quantity: ${meal['quantity']}', style: TextStyle(color: Colors.grey[600], fontSize: 16)),
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Total: ${total.toStringAsFixed(2)} €',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                      color: Colors.green,
                    ),
                  ),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      ElevatedButton(
                        onPressed: () => _editOrder(order),
                        child: Text('Edit', style: TextStyle(color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _updateOrderStatus(order['_id'], 'SERVED'),
                        child: Text('Mark as Served', style: TextStyle(color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}