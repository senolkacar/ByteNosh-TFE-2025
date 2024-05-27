import 'dart:convert';

import 'package:flutter/material.dart';
import '/components/left_side_menu.dart';
import '/models/food_item.dart';
import 'package:http/http.dart' as http;

class HomepageScreen extends StatefulWidget {
  final String userEmail;

  const HomepageScreen(
      {super.key,required this.userEmail}
      );

  @override
  State<HomepageScreen> createState() => _HomepageScreenState();
}

class _HomepageScreenState extends State<HomepageScreen> {
  late Future<List<FoodItem>> foodItems;
  final String baseUrl = 'http://10.0.2.2:5000';
  @override
  void initState() {
    super.initState();
    foodItems = fetchFoodItems();
  }

  Future<List<FoodItem>> fetchFoodItems() async {
    final response = await http.get(Uri.parse('http://10.0.2.2:5000/api/meals'));

    if (response.statusCode == 200) {
      List jsonResponse = jsonDecode(response.body);
      return jsonResponse.map((item) => FoodItem.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load food items');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      drawer: LeftSideMenu(userEmail: widget.userEmail),
      body: FutureBuilder<List<FoodItem>>(
        future: foodItems,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No food items available'));
          } else {
            return GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // Number of columns in the grid
                childAspectRatio: 0.8, // Adjust the aspect ratio as needed
              ),
              itemCount: snapshot.data!.length,
              itemBuilder: (context, index) {
                final foodItem = snapshot.data![index];
                final fullImageUrl = '$baseUrl${foodItem.imageUrl}';
                return Card(
                  margin: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: Image.network(
                          fullImageUrl,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              foodItem.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              foodItem.description,
                              style: const TextStyle(
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          }
        },
      ),
    );
  }
}



