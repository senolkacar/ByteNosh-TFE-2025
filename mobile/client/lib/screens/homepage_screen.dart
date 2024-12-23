import 'dart:convert';
import 'package:flutter/material.dart';
import '/models/food_item.dart';
import '/screens/food_details.dart';
import '/screens/profile_screen.dart';
import '/screens/reservation_screen.dart';
import '/constants/api_constants.dart';
import '/components/closure_alert.dart';
import '/services/api_service.dart';

class HomepageScreen extends StatefulWidget {
  final String userEmail;
  final Map<String, dynamic> userData;

  const HomepageScreen({super.key, required this.userEmail, required this.userData});

  @override
  State<HomepageScreen> createState() => _HomepageScreenState();
}

class _HomepageScreenState extends State<HomepageScreen> {
  late Future<List<FoodItem>> foodItems;
  TextEditingController searchController = TextEditingController();
  String selectedCategory = 'All dishes';

  @override
  void initState() {
    super.initState();
    foodItems = fetchFoodItems();
  }

  Future<List<FoodItem>> fetchFoodItems() async {
    final response = await ApiService.apiRequest('/api/meals', context: context);

    if (response.statusCode == 200) {
      List<dynamic> jsonResponse = jsonDecode(response.body);
      List<FoodItem> items = jsonResponse.map((item) => FoodItem.fromJson(item as Map<String, dynamic>)).toList();
      if (selectedCategory != 'All dishes') {
        items = items.where((item) => item.category.name == selectedCategory).toList();
      }
      return items;
    } else {
      throw Exception('Failed to load food items');
    }
  }

  void _showAddItemModal(FoodItem foodItem) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return AddItemModal(foodItem: foodItem);
      },
    );
  }

  void _onCategorySelected(String category) {
    setState(() {
      selectedCategory = category;
      foodItems = fetchFoodItems();
    });
  }

  @override
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
      body: SingleChildScrollView(
        child: Column(
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
                        _onCategorySelected('All dishes');
                      },
                    ),
                  ]),
            ),
            ClosureAlert(),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Container(
                height: 100.0, // Set a fixed height for the container
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    GestureDetector(
                      onTap: () => _onCategorySelected('All dishes'),
                      child: Card(
                        child: Container(
                          width: 100,
                          child: Center(child: Text('All dishes')),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _onCategorySelected('Starters'),
                      child: Card(
                        child: Container(
                          width: 100,
                          child: Center(child: Text('Starters')),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _onCategorySelected('Main Dishes'),
                      child: Card(
                        child: Container(
                          width: 100,
                          child: Center(child: Text('Main Dishes')),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _onCategorySelected('Desserts'),
                      child: Card(
                        child: Container(
                          width: 100,
                          child: Center(child: Text('Desserts')),
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => _onCategorySelected('Drinks'),
                      child: Card(
                        child: Container(
                          width: 100,
                          child: Center(child: Text('Drinks')),
                        ),
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
            FutureBuilder<List<FoodItem>>(
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
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 8.0,
                      mainAxisSpacing: 8.0,
                      childAspectRatio: 2/3, // Adjusted aspect ratio
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
                                '$baseUrl/images/${foodItem.imageUrl}',
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
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: Text(
                                foodItem.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Spacer(),
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Flexible(
                                    child: Text(
                                      '${foodItem.price.toStringAsFixed(2)}€',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      minimumSize: Size(0, 40),
                                      padding: EdgeInsets.symmetric(horizontal: 8.0),
                                    ),
                                    onPressed: () {
                                      _showAddItemModal(foodItem);
                                    },
                                    icon: Icon(Icons.read_more, size: 16),
                                    label: Text('More', style: TextStyle(fontSize: 14)),
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
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Reservations',
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
                  builder: (context) => ReservationScreen(),
                ),
              );
              break;
            case 2:
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