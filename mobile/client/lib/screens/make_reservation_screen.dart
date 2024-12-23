  import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
  import 'dart:convert';
  import '../services/api_service.dart';
  import 'package:intl/intl.dart';
  import '/models/table.dart';
  import 'package:jwt_decode/jwt_decode.dart';
  import 'reservation_screen.dart';
  import 'package:flutter_secure_storage/flutter_secure_storage.dart';
  import 'package:socket_io_client/socket_io_client.dart' as IO;
  import '/constants/api_constants.dart';
  import 'package:fluttertoast/fluttertoast.dart';



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
    List<String> _disabledDays = [];
    List<DateTime> _closureDays = [];
    TableInfo? _selectedTable; // Define _selectedTable as a nullable type
    String? _userId;
    String? _accessToken;
    bool _isTimeSlotEmpty = false;
    bool _noTableAvailable = false;
    bool _loadingWaitlist = false;
    bool _showTables = false;
    late IO.Socket socket;
    final FocusNode _guestFocusNode = FocusNode();
    final nameController = TextEditingController();
    final contactController = TextEditingController();
    final guestsController = TextEditingController();

    @override
    void initState() {
      super.initState();
      _loadUserData();
      _fetchSections();
      _fetchOpeningHours();
      _fetchClosureDays();
      _initializeSocketIO();
    }
    void _initializeSocketIO() {
      socket = IO.io(
        'http://$baseUrl',
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .build(),
      );

      socket.connect();

      socket.onConnect((_) {
        print('Connected to Socket.IO');
      });

      socket.onDisconnect((_) {
        print('Disconnected from Socket.IO');
      });

      socket.on('waitlist-update', (data) {
        print('Waitlist update received: $data');
      });

      socket.onError((error) {
        print('Socket.IO Error: $error');
      });

      socket.onReconnect((attempt) {
        print('Reconnected after $attempt attempts');
      });
    }

    @override
    void dispose() {
      socket.dispose();
      super.dispose();
    }

    Future<void> _loadUserData() async {
      try {
        // Retrieve the token from secure storage
        final token = await storage.read(key: 'accessToken');
        if (token != null) {
          setState(() {
            _accessToken = token;
            Map<String, dynamic> decodedToken = Jwt.parseJwt(token);
            _userId = decodedToken['id']; // Extract user ID from the token payload
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

    Future<void> _submitToWaitlist(String name, String contact, int guestNumber) async {
      if (_selectedDate == null || _selectedTimeSlot == null || _numberOfGuests == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please select a date, time, and number of guests.')),
        );
        return;
      }

      setState(() {
        _loadingWaitlist = true;
      });

      try {
        final response = await ApiService.apiRequest(
          '/api/waitlist',
          method: 'POST',
          context: context,
          data: {
            'name': name,
            'contact': contact,
            'guests': guestNumber,
            'reservationDate': _selectedDate!.toIso8601String(),
            'timeSlot': _selectedTimeSlot,
          },
        );

        if (response.statusCode == 201) {
          final data = jsonDecode(response.body);
          socket.emit('waitlist-update', data);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('You have been added to the waitlist.')),
          );
        } else {
          throw Exception('Failed to add to waitlist');
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      } finally {
        setState(() {
          _loadingWaitlist = false;
        });
      }
    }

    void _showWaitlistDialog() {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          title: Row(
            children: [
              Icon(Icons.list_alt, color: Colors.pink[700]),
              SizedBox(width: 8),
              Text(
                'Join the Waitlist',
                style: TextStyle(color: Colors.pink[700], fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'We’ll notify you if a table becomes available.',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: nameController,
                  decoration: InputDecoration(
                    labelText: 'Name',
                    prefixIcon: Icon(Icons.person, color: Colors.pink[700]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: contactController,
                  decoration: InputDecoration(
                    labelText: 'Contact (Email)',
                    prefixIcon: Icon(Icons.email, color: Colors.pink[700]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: guestsController,
                  decoration: InputDecoration(
                    labelText: 'Number of Guests',
                    prefixIcon: Icon(Icons.people, color: Colors.pink[700]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    filled: true,
                    fillColor: Colors.grey[200],
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Cancel',
                style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _submitToWaitlist(nameController.text, contactController.text, int.parse(guestsController.text));
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ReservationScreen(),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink[700],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: Text('Submit', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    }



    Future<void> _fetchOpeningHours() async {
      try {
        final response = await ApiService.apiRequest('/api/opening-hours',context: context);
        if (response.statusCode == 200) {
          final openingHours = jsonDecode(response.body);

          // Extract closed days
          final closedDays = openingHours
              .where((day) => !day['isOpen'])
              .map<String>((day) => day['day'].toString().toLowerCase()) // Ensure lowercase
              .toList();

          if (kDebugMode) {
            print("Closed Days from API: $closedDays");
          }

          setState(() {
            _disabledDays = closedDays;
          });
        } else {
          throw Exception('Failed to fetch opening hours');
        }
      } catch (error) {
        if (kDebugMode) {
          print('Failed to fetch opening hours: $error');
        }
      }
    }

    Future<void> _fetchClosureDays() async {
      try {
        final response = await ApiService.apiRequest('/api/closures',context: context);
        if (response.statusCode == 200) {
          final closures = jsonDecode(response.body);
          setState(() {
            _closureDays = closures
                .map<DateTime>((closure) => DateTime.parse(closure['date']))
                .toList();
          });
        } else {
          throw Exception('Failed to fetch closure days');
        }
      } catch (error) {
        if (kDebugMode) {
          print('Failed to fetch closure days: $error');
        }
      }
    }

    Future<void> _fetchTimeSlots(DateTime selectedDate) async {
      setState(() {
        _loadingSlots = true;
      });
      try {
        final response = await ApiService.apiRequest(
          '/api/opening-hours?date=${selectedDate.toIso8601String()}',
          context: context,
        );
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final openHour = data['openHour'];
          final closeHour = data['closeHour'];
          _generateTimeSlots(selectedDate, openHour, closeHour);
          if (selectedDate.year == DateTime.now().year &&
              selectedDate.month == DateTime.now().month &&
              selectedDate.day == DateTime.now().day) {
            setState(() {
              _isTimeSlotEmpty = _timeSlots.isEmpty;
            });
            if (_isTimeSlotEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('No available time slots for today. Please select another date.')),
              );
            }
          }
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
        final response = await ApiService.apiRequest(
          '/api/sections/$_selectedSection/tables?reservationDate=${_selectedDate!.toIso8601String()}&timeSlot=$_selectedTimeSlot',
          context: context,
        );
        if (response.statusCode == 200) {
          final List<dynamic> tables = jsonDecode(response.body);
          setState(() {
            _tables = tables.map((table) => TableInfo.fromMap(table)).toList();
            _noTableAvailable = _filteredTables().isEmpty;
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

  bool _noTimeSlotLeft(DateTime date) {
  final now = DateTime.now();

  // Only check for today
  if (date.year != now.year || date.month != now.month || date.day != now.day) {
    return false;
  }

  final cutoffTime = now.add(Duration(hours: 2));

  // Filter time slots to see if any valid slots remain for today
  final validSlots = _timeSlots.where((slot) {
    final slotStartTime = DateTime(
      date.year,
      date.month,
      date.day,
      int.parse(slot.split(' - ')[0].split(':')[0]), // Start hour
      int.parse(slot.split(' - ')[0].split(':')[1]), // Start minute
    );

    return slotStartTime.isAfter(cutoffTime); // Check if slot is valid
  }).toList();

  // Check if the difference between start hour and close hour is less than 1 hour or passed
  if (validSlots.isEmpty && _timeSlots.isNotEmpty) {
    final lastSlotEndTime = DateTime(
      date.year,
      date.month,
      date.day,
      int.parse(_timeSlots.last.split(' - ')[1].split(':')[0]), // End hour
      int.parse(_timeSlots.last.split(' - ')[1].split(':')[1]), // End minute
    );

    if (lastSlotEndTime.isBefore(now) || lastSlotEndTime.difference(now).inMinutes < 60) {
      return true;
    }
  }

  return validSlots.isEmpty;
}


    void _generateTimeSlots(DateTime date, String openHour, String closeHour) {
      final List<String> slots = [];
      DateTime now = DateTime.now();
      DateTime startDateTime = DateTime(date.year, date.month, date.day,
          int.parse(openHour.split(':')[0]), int.parse(openHour.split(':')[1]));
      DateTime endDateTime = DateTime(date.year, date.month, date.day,
          int.parse(closeHour.split(':')[0]), int.parse(closeHour.split(':')[1]));

      // If the selected date is today, ensure the start time is at least 2 hours from now
      if (date.year == now.year && date.month == now.month && date.day == now.day) {
        startDateTime = now.add(Duration(hours: 2));
        startDateTime = DateTime(date.year, date.month, date.day, startDateTime.hour, 0); // Round to the next hour
      }

      while (startDateTime.isBefore(endDateTime)) {
        DateTime nextSlot = startDateTime.add(Duration(hours: 1));
        slots.add('${DateFormat('HH:mm').format(startDateTime)} - ${DateFormat('HH:mm').format(nextSlot)}');
        startDateTime = nextSlot;
      }

      setState(() {
        _timeSlots = slots;
        _isTimeSlotEmpty = slots.isEmpty;
      });
    }

    void _handleDateSelection(DateTime? date) {
      if (date != null) {
        setState(() {
          _selectedDate = date;
          _selectedTimeSlot = null;
          _isTimeSlotEmpty = false;
        });
        _fetchTimeSlots(date);
      }
    }

    bool _isFormValid() {
      return _selectedDate != null &&
          _selectedTimeSlot != null &&
          _selectedSection != null &&
          _numberOfGuests != null &&
          _selectedTable != null;
    }

    bool _isDateDisabled(DateTime selectedDate) {
      final now = DateTime.now();
      final isToday = selectedDate.year == now.year &&
          selectedDate.month == now.month &&
          selectedDate.day == now.day;

      final isPast = selectedDate.isBefore(DateTime(now.year, now.month, now.day));
      final isClosureDay = _closureDays.any(
              (closure) => closure.toIso8601String().split('T')[0] == selectedDate.toIso8601String().split('T')[0]);

      // Format weekday in lowercase for consistency
      final selectedWeekday = DateFormat('EEEE').format(selectedDate).toLowerCase();
      final isDisabledWeekday = _disabledDays.contains(selectedWeekday);

      final noSlotsToday = isToday && _noTimeSlotLeft(selectedDate);

      return isPast || isClosureDay || isDisabledWeekday || noSlotsToday;
    }




    void _handleReservation() async {
      if (_selectedDate == null || _selectedTimeSlot == null || _selectedSection == null || _numberOfGuests == null || _selectedTable == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill in all fields to make a reservation.')),
        );
        return;
      }

      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(child: CircularProgressIndicator()),
      );

      try {
        final response = await ApiService.apiRequest(
          '/api/reservations',
          method: 'POST',
          context: context,
          data: {
            'userId': _userId,
            'tableId': _selectedTable!.id,
            'reservationDate': _selectedDate!.toIso8601String(),
            'timeSlot': _selectedTimeSlot,
            'sectionId': _selectedSection,
            'guests': _numberOfGuests,
          },
        );

        Navigator.pop(context); // Close loading indicator

        if (response.statusCode == 201) {
          // Show success message
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text(
                'Reservation Confirmed',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              content: Column(
    mainAxisSize: MainAxisSize.min,
    children: const [
      Icon(Icons.check_circle, color: Colors.green, size: 80),
      SizedBox(height: 10),
      Text(
        'Your reservation has been completed.',
        textAlign: TextAlign.center,
      ),
    ],
  ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context); // Close success dialog
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ReservationScreen(),
                      ),
                    );
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        } else {
          final errorResponse = jsonDecode(response.body);
          if (kDebugMode) {
            print('Error Response: ${errorResponse.toString()}');
          }
          throw Exception('Failed to make reservation: ${response.body}');
        }
      } catch (e) {
        Navigator.pop(context); // Close loading indicator
        if (kDebugMode) {
          print('Exception: $e');
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
    List<TableInfo> _filteredTables() {
      if (_numberOfGuests == null) return [];

      List<TableInfo> availableTables =
      _tables.where((table) => table.status == 'AVAILABLE').toList();

      // Logic based on guests number
      if (_numberOfGuests == 1) {
        // Guests = 1: Allow only tables with 2 seats
        return availableTables.where((table) => table.seats == 2).toList();
      }

      if (_numberOfGuests == 2) {
        // Guests = 2: Prioritize tables for 2, fallback to 4 if no 2-seat tables
        bool hasAvailableTablesForTwo = availableTables
            .any((table) => table.seats == 2 && table.status != 'RESERVED');

        return availableTables
            .where((table) =>
        (table.seats == 2) ||
            (table.seats == 4 && !hasAvailableTablesForTwo))
            .toList();
      }

      if (_numberOfGuests! > 2 && _numberOfGuests! <= 4) {
        // Guests between 3 and 4: Allow tables for 4, fallback to 6 if necessary
        bool hasAvailableTablesForFour = availableTables
            .any((table) => table.seats == 4 && table.status != 'RESERVED');

        return availableTables
            .where((table) =>
        (table.seats == 4) ||
            (table.seats == 6 && !hasAvailableTablesForFour))
            .toList();
      }

      if(_numberOfGuests! > 4 && _numberOfGuests! <= 6) {
        // Guests > 4: Allow only tables for 6
        return availableTables.where((table) => table.seats == 6).toList();
      }

      return [];
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
                    DateTime initialDate = DateTime.now();
                    DateTime firstDate = DateTime.now();
                    while (_isDateDisabled(firstDate)) {
                      firstDate = firstDate.add(Duration(days: 1));
                      initialDate = firstDate;
                    }
                    final pickedDate = await showDatePicker(
                      context: context,
                      initialDate: initialDate,
                      firstDate: firstDate,
                      lastDate: DateTime.now().add(Duration(days: 365)),
                      selectableDayPredicate: (date) => !_isDateDisabled(date),
                      locale: const Locale('en', 'GB'),
                    );

                    if (pickedDate != null) {
                      _handleDateSelection(pickedDate);
                    } else {
                      if (kDebugMode) {
                        print("No date selected");
                      }
                    }
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
                GestureDetector(
                  onTap: () {
                    if (_timeSlots.isEmpty) {
                      Fluttertoast.showToast(
                        msg: "No time slots left for this day",
                        toastLength: Toast.LENGTH_SHORT,
                        gravity: ToastGravity.BOTTOM,
                        backgroundColor: Colors.red,
                        textColor: Colors.white,
                      );
                    }
                  },
                  child: DropdownButtonFormField<String>(
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
                focusNode: _guestFocusNode,
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
                    _showTables = false;
                  });

                },
                onFieldSubmitted: (_) {
                  _guestFocusNode.unfocus(); // Unfocus the text field to prevent form submission
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
                onPressed: () {
                  if (_numberOfGuests != null && _numberOfGuests! > 0 && _numberOfGuests! <= 6) {
                    setState(() {
                      _showTables = true;
                      _loadingTables = true;
                      _selectedTable = null;
                    });
                    _fetchTables();
                  }
                },
                child: Text('Search for Tables', style: TextStyle(fontSize: 16)),
              ),
              SizedBox(height: 16),
              if (_noTableAvailable)
                Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, color: Colors.red, size: 28),
                        SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            'No tables are available for the selected date and time slot.',
                            style: TextStyle(fontSize: 16, color: Colors.red, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _showWaitlistDialog,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        minimumSize: Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: Icon(Icons.add_alert, size: 24),
                      label: Text('Join Waitlist', style: TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              SizedBox(height: 16),
              if (_loadingTables)
                Center(child: CircularProgressIndicator())
              else if (_showTables) ...[
                if (_filteredTables().isNotEmpty)
                  Text('Available Tables:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                SizedBox(height: 8),
                ListView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  itemCount: _filteredTables().length,
                  itemBuilder: (context, index) {
                    final table = _filteredTables()[index];
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
                onPressed: _isFormValid() ? _handleReservation : null,
                child: Text('Confirm Reservation', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      );
    }
  }