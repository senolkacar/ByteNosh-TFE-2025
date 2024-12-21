import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '/models/table.dart';
import 'package:jwt_decode/jwt_decode.dart';
import '/services/api_service.dart';
import 'dart:convert';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '/constants/api_constants.dart';
import '/screens/table_details_screen.dart';

final storage = FlutterSecureStorage();

class TakeOrderScreen extends StatefulWidget {
  @override
  State<TakeOrderScreen> createState() => _TakeOrderScreenState();
}

class _TakeOrderScreenState extends State<TakeOrderScreen> {
  List<Map<String, dynamic>> _sections = [];
  List<TableInfo> _tables = [];
  bool _loadingSections = false;
  bool _loadingTables = false;
  TableInfo? _selectedTable;
  String? _selectedSection;
  String? _accessToken;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _fetchSections();
    _loadUserData();
    _initializeSocketIO();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _fetchTables();
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

  Future<void> _fetchSections() async {
    setState(() {
      _loadingSections = true;
    });
    try {
      final response = await ApiService.apiRequest('/api/sections', context: context);
      if (response.statusCode == 200) {
        final List<dynamic> sections = jsonDecode(response.body);
        setState(() {
          _sections = sections.map((section) {
            return {
              'id': section['_id'],
              'name': section['name'],
            };
          }).toList();
        });
      } else {
        throw Exception('Failed to load sections');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _loadingSections = false;
      });
    }
  }

  Future<void> _fetchTables() async {
    if (_selectedSection == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a section')),
      );
      return;
    }
    setState(() {
      _loadingTables = true;
    });

    try {
      final currentDate = DateTime.now();
      final currentTimeSlot = TimeOfDay.now().format(context);

      final response = await ApiService.apiRequest(
        '/api/sections/${_selectedSection}/tables?reservationDate=${currentDate.toIso8601String()}&timeSlot=${currentTimeSlot}',
        context: context,
      );
      if (response.statusCode == 200) {
        final List<dynamic> tables = jsonDecode(response.body);
        setState(() {
          _tables = tables.map((table) => TableInfo.fromMap(table)).toList();
        });
      } else {
        throw Exception('Failed to load tables');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _loadingTables = false;
      });
    }
  }

  void _initializeSocketIO() {
    final socket = IO.io(
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
      print('Connected to WebSocket');
    });

    // Listen for disconnection events
    socket.onDisconnect((_) {
      print('Disconnected from WebSocket');
    });

    // Listen for specific events
    socket.on('update-table-status', (data) {
      if (data != null && data is Map<String, dynamic> && data['tableId'] != null && data['status'] != null) {
        setState(() {
          _tables = _tables.map((table) {
            if (table.id == data['tableId']) {
              return table.copyWith(status: data['status']);
            }
            return table;
          }).toList();
        });
      } else {
        print('Invalid or null table data received: $data');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Take Order', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select a Section:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            SizedBox(height: 8),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.grey[200],
              ),
              hint: Text('Select a section'),
              value: _selectedSection,
              items: _sections.map((section) {
                return DropdownMenuItem<String>(
                  value: section['id'],
                  child: Text(section['name']!),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedSection = value;
                });
              },
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink[700],
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: _fetchTables,
              child: Text('Load Tables'),
            ),
            const SizedBox(height: 16),
            if (_loadingTables)
              Center(child: CircularProgressIndicator())
            else if (_tables.isEmpty)
              Center(child: Text('No tables found'))
            else
              GridView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 3 / 2,
                ),
                itemCount: _tables.length,
                itemBuilder: (context, index) {
                  final table = _tables[index];
                  final isSelected = _selectedTable?.id == table.id;
                  final isAvailable = table.status == 'AVAILABLE';

                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _selectedTable = table;
                      });
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => TableDetailsScreen(table: table),
                        ),
                      );
                    },
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      elevation: 5,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15),
                          gradient: isSelected
                              ? LinearGradient(
                            colors: [Colors.green[400]!, Colors.green[700]!],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                              : LinearGradient(
                            colors: [Colors.grey[300]!, Colors.grey[500]!],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Stack(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Table: ${table.name}',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: isSelected ? Colors.white : Colors.black,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Seats: ${table.seats}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: isSelected ? Colors.white : Colors.black,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Status: ${table.status}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: isSelected && isAvailable ? Colors.white : (isAvailable ? Colors.green : Colors.red),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Positioned(
                                bottom: 8,
                                right: 8,
                                child: Icon(
                                  Icons.check_circle,
                                  color: Colors.white,
                                  size: 24,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              )
          ],
        ),
      ),
    );
  }
}
