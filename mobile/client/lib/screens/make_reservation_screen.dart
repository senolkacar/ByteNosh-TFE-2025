import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '/constants/api_constants.dart';
import 'package:intl/intl.dart';
import '/models/table.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';


final storage = FlutterSecureStorage();

class MakeReservationScreen extends StatefulWidget {
  @override
  State<MakeReservationScreen> createState() => _MakeReservationScreenState();
}

class _MakeReservationScreenState extends State<MakeReservationScreen> {
  DateTime? _selectedDate;
  String? _selectedTimeSlot;
  String? _selectedSection;
  int? _numberOfGuests;
  List<String> _timeSlots = [];
  List<Map<String, dynamic>> _sections = []; // Changed type to dynamic
  List<TableInfo> _tables = [];
  bool _loadingSlots = false;
  bool _loadingSections = false;
  bool _loadingTables = false;
  TableInfo? _selectedTable; // Define _selectedTable as a nullable type
  String? _userId;
  String? _accessToken;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _fetchSections();
  }

  Future<void> _loadUserData() async {
    try {
      // Retrieve the token from secure storage
      final token = await storage.read(key: 'user_token');
      if (token != null) {
        setState(() {
          _accessToken = token;
          Map<String, dynamic> decodedToken = Jwt.parseJwt(token);
          _userId = decodedToken['id']; // Extract user ID from the token payload
        });
      }
    } catch (error) {
      print('Error loading user data: $error');
    }
  }

  Future<void> _fetchSections() async {
    setState(() {
      _loadingSections = true;
    });
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/sections'));
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

  Future<void> _fetchTimeSlots(DateTime selectedDate) async {
    setState(() {
      _loadingSlots = true;
    });
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/opening-hours?date=${selectedDate.toIso8601String()}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer $_accessToken',
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final openHour = data['openHour'];
        final closeHour = data['closeHour'];
        _generateTimeSlots(selectedDate, openHour, closeHour);
      } else {
        throw Exception('Failed to load time slots');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _loadingSlots = false;
      });
    }
  }

  Future<void> _fetchTables() async {
    if (_selectedSection == null || _selectedDate == null || _selectedTimeSlot == null || _numberOfGuests == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill in all fields to search for tables.')),
      );
      return;
    }

    setState(() {
      _loadingTables = true;
    });

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/sections/$_selectedSection/tables?reservationDate=${_selectedDate!.toIso8601String()}&timeSlot=$_selectedTimeSlot'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer $_accessToken',
        },
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

  void _generateTimeSlots(DateTime date, String openHour, String closeHour) {
    final List<String> slots = [];
    DateTime startDateTime = DateTime(date.year, date.month, date.day,
        int.parse(openHour.split(':')[0]), int.parse(openHour.split(':')[1]));
    DateTime endDateTime = DateTime(date.year, date.month, date.day,
        int.parse(closeHour.split(':')[0]), int.parse(closeHour.split(':')[1]));

    while (startDateTime.isBefore(endDateTime)) {
      DateTime nextSlot = startDateTime.add(Duration(hours: 1));
      slots.add('${DateFormat('HH:mm').format(startDateTime)} - ${DateFormat('HH:mm').format(nextSlot)}');
      startDateTime = nextSlot;
    }

    setState(() {
      _timeSlots = slots;
    });
  }

  void _handleDateSelection(DateTime? date) {
    if (date != null) {
      setState(() {
        _selectedDate = date;
        _selectedTimeSlot = null;
      });
      _fetchTimeSlots(date);
    }
  }

  void _handleReservation() async {
    if (_selectedDate == null || _selectedTimeSlot == null || _selectedSection == null || _numberOfGuests == null || _selectedTable == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill in all fields to make a reservation.')),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/reservations'),
        headers: {'Content-Type': 'application/json',
          'Authorization':'Bearer $_accessToken'
        },
        body: jsonEncode({
          'userId': _userId,
          'tableId': _selectedTable!.id,
          'reservationDate': _selectedDate!.toIso8601String(),
          'timeSlot': _selectedTimeSlot,
          'sectionId': _selectedSection, // Correct key
          'guests': _numberOfGuests,
        }),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Reservation confirmed!')),
        );
        Navigator.pop(context);
      } else {
        final errorResponse = jsonDecode(response.body);
        print('Error Response: ${errorResponse.toString()}');
        throw Exception('Failed to make reservation: ${response.body}');
      }
    } catch (e) {
      print('Exception: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

    @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Make a New Reservation', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Select a Date:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            SizedBox(height: 8),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink[700],
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () async {
                DateTime? pickedDate = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(Duration(days: 365)),
                );
                _handleDateSelection(pickedDate);
              },
              child: Text(
                _selectedDate == null
                    ? 'Pick a date'
                    : DateFormat('dd/MM/yyyy').format(_selectedDate!),
                style: TextStyle(fontSize: 16),
              ),
            ),
            SizedBox(height: 16),
            if (_loadingSlots)
              Center(child: CircularProgressIndicator())
            else ...[
              Text('Available Time Slots:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              SizedBox(height: 8),
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  filled: true,
                  fillColor: Colors.grey[200],
                ),
                hint: Text('Select a time slot'),
                value: _selectedTimeSlot,
                items: _timeSlots.map((slot) {
                  return DropdownMenuItem<String>(
                    value: slot,
                    child: Text(slot),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedTimeSlot = value;
                  });
                },
              ),
            ],
            SizedBox(height: 16),
            if (_loadingSections)
              Center(child: CircularProgressIndicator())
            else ...[
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
            ],
            SizedBox(height: 16),
            Text('Number of Guests:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            SizedBox(height: 8),
            TextFormField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Enter number of guests',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.grey[200],
              ),
              onChanged: (value) {
                setState(() {
                  _numberOfGuests = int.tryParse(value);
                });
              },
            ),
            SizedBox(height: 16),
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
              child: Text('Search for Tables', style: TextStyle(fontSize: 16)),
            ),
            SizedBox(height: 16),
            if (_loadingTables)
              Center(child: CircularProgressIndicator())
            else ...[
              Text('Available Tables:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              SizedBox(height: 8),
              ListView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemCount: _tables.length,
                itemBuilder: (context, index) {
                  final table = _tables[index];
                  final isAvailable = table.status == 'AVAILABLE';
                  final isSelected = _selectedTable?.id == table.id;
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 5,
                    child: ListTile(
                      title: Text('Table: ${table.name} - Seats: ${table.seats}', style: TextStyle(fontSize: 16)),
                      subtitle: Text(isAvailable ? 'Available' : 'Not Available',
                          style: TextStyle(color: isAvailable ? Colors.green : Colors.red)),
                      trailing: isAvailable
                          ? IconButton(
                        icon: Icon(
                          isSelected ? Icons.check_circle : Icons.check_circle_outline,
                          color: isSelected ? Colors.green : Colors.grey,
                        ),
                        onPressed: () {
                          setState(() {
                            _selectedTable = table;
                          });
                        },
                      )
                          : null,
                    ),
                  );
                },
              )
            ],
            SizedBox(height: 16),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink[700],
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: _handleReservation,
              child: Text('Confirm Reservation', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}