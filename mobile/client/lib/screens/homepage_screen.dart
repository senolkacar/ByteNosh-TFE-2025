import 'dart:convert';
import 'package:flutter/material.dart';
import '/models/food_item.dart';
import '/screens/add_screen.dart';
import '/screens/profile_screen.dart';
import '/screens/menu_screen.dart';
import 'package:http/http.dart' as http;

class HomepageScreen extends StatefulWidget {
  final String userEmail;

  const HomepageScreen({super.key, required this.userEmail});

  @override
  State<HomepageScreen> createState() => _HomepageScreenState();
}

class _HomepageScreenState extends State<HomepageScreen> {
  late Future<List<FoodItem>> foodItems;
  final String baseUrl = 'http://10.0.2.2:5000';
  TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    foodItems = fetchFoodItems();
  }

  Future<List<FoodItem>> fetchFoodItems() async {
    final response = await http.get(Uri.parse('$baseUrl/api/meals'));

    if (response.statusCode == 200) {
      List jsonResponse = jsonDecode(response.body);
      print(jsonResponse);
      return jsonResponse.map((item) => FoodItem.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load food items');
    }
  }

  void _showAddItemModal(FoodItem foodItem) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return AddItemModal(foodItem: foodItem);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: const Text(
          'ByteNosh',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          Text('Welcome, '),
          Text(widget.userEmail,
              style: TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.black)),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Search...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Our Menu',
                      style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold)),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.pink[900],
                      backgroundColor: Colors.white,
                      textStyle: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    child: const Text('View All'),
                    onPressed: () {
                      // Redirect to the menu page
                    },
                  ),
                ]),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Container(
              height: 100.0, // Set a fixed height for the container
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  Card(
                    child: Container(
                      width: 100,
                      child: Center(child: Text('All dishes')),
                    ),
                  ),
                  Card(
                    child: Container(
                      width: 100,
                      child: Center(child: Text('Starters')),
                    ),
                  ),
                  Card(
                    child: Container(
                      width: 100,
                      child: Center(child: Text('Main Dishes')),
                    ),
                  ),
                  Card(
                    child: Container(
                      width: 100,
                      child: Center(child: Text('Desserts')),
                    ),
                  ),
                  Card(
                    child: Container(
                      width: 100,
                      child: Center(child: Text('Drinks')),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Popular Dishes',
                style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<FoodItem>>(
              future: foodItems,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(child: Text('No popular dishes available'));
                } else {
                  return GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8.0,
                      mainAxisSpacing: 8.0,
                      childAspectRatio: 2/2.5,
                    ),
                    itemCount: snapshot.data!.length,
                    itemBuilder: (context, index) {
                      final foodItem = snapshot.data![index];
                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(10),
                                topRight: Radius.circular(10),
                              ),
                              child: Image.network(
                                '$baseUrl${foodItem.imageUrl}',
                                width: double.infinity,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                foodItem.name,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: Text(foodItem.description,maxLines: 2,
                                overflow: TextOverflow.ellipsis,),
                            ),
                            Spacer(),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${foodItem.price.toStringAsFixed(2)}€',
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
                                        _showAddItemModal(foodItem);
                                      },
                                      icon: Icon(Icons.add_shopping_cart),
                                      label: Text('Add'),
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
          ),
        ],
      ),

        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.menu),
              label: 'Menu',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_cart),
              label: 'Cart',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite),
              label: 'Favorites',
            ),
            BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile'
            ),
          ],
          onTap: (index) {
            switch (index) {
              case 0:
                break;
              case 1:
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MenuScreen(),
                  ),
                );
                break;
              case 2:
                // Redirect to the cart page
                break;
              case 3:
                // Redirect to the favorites page
                break;
              case 4:
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ProfileScreen(userEmail: widget.userEmail),
                  ),
                );
                break;
            }
          },
        ),
    );
  }
}
