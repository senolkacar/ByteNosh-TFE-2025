
import 'package:flutter/material.dart';
import '/models/table.dart';
import '/screens/encode_order_screen.dart';
import '/services/api_service.dart';
import '/screens/view_order_screen.dart';
import '/screens/request_payment.dart';


class TableDetailsScreen extends StatefulWidget {
  final TableInfo table;

  TableDetailsScreen({required this.table});

  @override
  _TableDetailsScreenState createState() => _TableDetailsScreenState();
}

class _TableDetailsScreenState extends State<TableDetailsScreen> {
  late TableInfo table;

  @override
  void initState() {
    super.initState();
    table = widget.table;
  }

  Future<void> _updateTableStatus(String newStatus) async {
    final response = await ApiService.apiRequest(
      '/api/tables/${table.id}/$newStatus',
      context: context,
      method: 'PUT',
      data: {},
    );

    if (response.statusCode == 200) {
      setState(() {
        table = TableInfo(
          id: table.id,
          number: table.number,
          name: table.name,
          seats: table.seats,
          status: newStatus == 'occupy' ? 'OCCUPIED' : 'AVAILABLE',
        );
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Table status successfully updated')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update table status')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Table Details', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              elevation: 5,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${table.name}',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Seats: ${table.seats}',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Status: ${table.status}',
                      style: TextStyle(
                        fontSize: 18,
                        color: table.status == 'AVAILABLE' ? Colors.green : Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ViewOrderScreen(table: table),
                  ),
                );
              },
              icon: Icon(Icons.view_list),
              label: Text('View Orders'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => EncodeOrderScreen(table: table),
                  ),
                );
              },
              icon: Icon(Icons.add),
              label: Text('Encode New Orders'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () async {
                if (table.status == 'AVAILABLE') {
                  await _updateTableStatus('occupy');
                } else {
                  await _updateTableStatus('free');
                }
              },
              icon: Icon(Icons.event_seat),
              label: Text('Set Table Status'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purple,
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => RequestPayment(tableId: table.id),
                  ),
                );
              },
              icon: Icon(Icons.payment),
              label: Text('Request Payment'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}