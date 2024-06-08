import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:client/model/menu_item.dart';
import 'dart:convert';

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  String selectedCategory = 'Drinks';
  List<String> categories = ['Drinks', 'Starters', 'Main Dishes', 'Desserts'];
  List<MenuItem> menuItems = [];
  final String baseUrl = 'http://10.0.2.2:5000';

  @override
  void initState() {
    super.initState();
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
    final response = await http.get(Uri.parse('$baseUrl/api/meals?categoryName=$category'));

    if (response.statusCode == 200) {
      List jsonResponse = jsonDecode(response.body);
      setState(() {
        menuItems = jsonResponse.map((item) => MenuItem.fromJson(item)).toList();
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

  IconData _getLeadingIcon(String category) {
    switch (category) {
      case 'Drinks':
        return Icons.local_bar;
      case 'Starters':
        return Icons.fastfood;
      case 'Main Dishes':
        return Icons.restaurant;
      case 'Desserts':
        return Icons.cake;
      default:
        return Icons.circle;
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Restaurant Menu'),
      ),
      body: Row(
        children: [
          // Sidebar
          Container(
            width: 250,
            color: Colors.blueGrey[700],
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                DrawerHeader(
                  decoration: BoxDecoration(
                    color: Colors.blueGrey[900],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        children: [
                          Icon(
                            Icons.keyboard_backspace,
                            size: 40,
                            color: Colors.white,
                          ),
                          SizedBox(height: 10),
                          Text(
                            'BACK',
                            style: TextStyle(fontSize: 20, color: Colors.white),
                          ),
                        ],
                      ),
                      Column(
                        children: [
                          Icon(
                            Icons.back_hand,
                            size: 40,
                            color: Colors.white,
                          ),
                          SizedBox(height: 10),
                          Text(
                            'REQUEST\nWAITER',
                            style: TextStyle(fontSize: 20, color: Colors.white),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                ...categories.map((category) {
                  return ListTile(
                    leading: Icon(
                      _getLeadingIcon(category),
                      color: Colors.white,
                    ),
                    title: Text(category, style: TextStyle(color: Colors.white)),
                    trailing: selectedCategory == category ? Icon(Icons.arrow_back, color: Colors.white) : null,
                    selected: selectedCategory == category,
                    onTap: () {
                      onCategorySelected(category);
                    },
                  );
                }).toList(),
              ],
            ),
          ),
          // Main content
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.all(10),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: menuItems.length,
              itemBuilder: (context, index) {
                return Card(
                  elevation: 5,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Image.network(
                        '$baseUrl${menuItems[index].imageUrl}',
                        width: double.infinity,
                        height: 200,
                        fit: BoxFit.cover,
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          menuItems[index].name,
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8.0),
                        child: Text(menuItems[index].description,maxLines: 2,
                          overflow: TextOverflow.ellipsis,),
                      ),
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${menuItems[index].price.toStringAsFixed(2)}€',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  foregroundColor: Colors.pink,
                                ),
                                onPressed: () {
                                  // Add to cart
                                },
                                icon: Icon(Icons.add_shopping_cart),
                                label: Text('Add'),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}