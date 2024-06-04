import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:client/component/side_drawer.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  String selectedCategory = 'DRINKS';
  List<String> categories = [];
  List<String> menuItems = [];
  final String baseUrl = 'http://10.0.2.2:5000';

  @override
  void initState() {
    super.initState();
    fetchCategories();
    fetchMenuItems(selectedCategory);
  }

  Future<void> fetchCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/api/categories'));

    if (response.statusCode == 200) {
      List jsonResponse = jsonDecode(response.body);
      setState(() {
        categories = jsonResponse.map((category) => category['name'].toString()).toList();
      });
    } else {
      throw Exception('Failed to load categories');
    }
  }

  Future<void> fetchMenuItems(String category) async {
    final response = await http.get(Uri.parse('$baseUrl/api/meals?category=$category'));

    if (response.statusCode == 200) {
      List jsonResponse = jsonDecode(response.body);
      setState(() {
        menuItems = jsonResponse.map((item) => item['name'].toString()).toList();
      });
    } else {
      throw Exception('Failed to load menu items');
    }
  }

  void onCategorySelected(String category) {
    setState(() {
      selectedCategory = category;
      fetchMenuItems(category);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Restaurant Menu'),
      ),
      drawer: SideDrawer(onCategorySelected: onCategorySelected),
      body: GridView.builder(
        padding: EdgeInsets.all(10),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        itemCount: menuItems.length,
        itemBuilder: (context, index) {
          return Card(
            elevation: 5,
            child: Center(
              child: Text(
                menuItems[index],
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          );
        },
      ),
    );
  }
}

