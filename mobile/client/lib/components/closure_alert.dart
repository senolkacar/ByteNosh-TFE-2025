import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '/services/api_service.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class ClosureAlert extends StatefulWidget {
  @override
  _ClosureAlertState createState() => _ClosureAlertState();
}

class _ClosureAlertState extends State<ClosureAlert> {
  late Future<List<Map<String, dynamic>>> closureDays;
  bool isDismissed = false;

  @override
  void initState() {
    super.initState();
    _checkDismissedState();
    closureDays = fetchClosureDays();
  }

  Future<void> _checkDismissedState() async {
    final prefs = await SharedPreferences.getInstance();
    final currentWeek = _getCurrentWeek();
    final dismissedWeek = prefs.getString('dismissedWeek');

    if (dismissedWeek == currentWeek) {
      setState(() {
        isDismissed = true;
      });
    }
  }

  Future<void> _setDismissedState() async {
    final prefs = await SharedPreferences.getInstance();
    final currentWeek = _getCurrentWeek();
    await prefs.setString('dismissedWeek', currentWeek);
    setState(() {
      isDismissed = true;
    });
  }

  String _getCurrentWeek() {
    final now = DateTime.now();
    final yearStart = DateTime(now.year);
    final dayOfYear = now.difference(yearStart).inDays + 1;
    final week = (dayOfYear - now.weekday + 10) ~/ 7;
    return '${now.year}-W${week.toString().padLeft(2, '0')}';
  }

  Future<List<Map<String, dynamic>>> fetchClosureDays() async {
    final response = await ApiService.apiRequest('/api/closures/current-week-closures', context: context);

    if (response.statusCode == 200) {
      List<dynamic> jsonResponse = jsonDecode(response.body);
      return List<Map<String, dynamic>>.from(jsonResponse.map((item) => item as Map<String, dynamic>));
    } else {
      throw Exception('Failed to load closure days');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isDismissed) return SizedBox.shrink();

    return FutureBuilder<List<Map<String, dynamic>>>(
      future: closureDays,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return SizedBox.shrink(); // Placeholder while loading
        } else if (snapshot.hasError) {
          return SizedBox.shrink(); // Handle error state gracefully
        } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
          return Padding(
            padding: const EdgeInsets.all(8.0),
            child: Card(
              color: Colors.yellow[100],
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Important Notice',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: Icon(Icons.close, color: Colors.red),
                          onPressed: _setDismissedState,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'This week the restaurant will be closed on the following date(s):',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    for (var closure in snapshot.data!)
                      Text(
                        'Date: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(closure['date']).toLocal())}, Reason: ${closure['reason'] ?? 'No reason provided'}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                  ],
                ),
              ),
            ),
          );
        } else {
          return SizedBox.shrink(); // No closures, no alert
        }
      },
    );
  }
}