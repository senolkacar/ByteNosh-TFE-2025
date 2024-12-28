import 'dart:convert';
import 'package:flutter/material.dart';
import '/models/food_item.dart';
import '/services/api_service.dart';
import '/constants/api_constants.dart';
import '/models/table.dart';

class EncodeOrderScreen extends StatefulWidget {
  final TableInfo table;

  const EncodeOrderScreen({required this.table});
  @override
  _EncodeOrderScreenState createState() => _EncodeOrderScreenState();
}

class _EncodeOrderScreenState extends State<EncodeOrderScreen> {
  late TableInfo table;
  List<FoodItem> _meals = [];
  List<FoodItem> _filteredMeals = [];
  String _selectedCategory = 'All';
  Map<FoodItem, int> _cart = {};
  bool _loadingMeals = true;
  TextEditingController _searchController = TextEditingController();
  String _notes = '';

  @override
  void initState() {
    super.initState();
    table = widget.table;
    _fetchMeals();
    _searchController.addListener(_filterMeals);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchMeals() async {
    setState(() {
      _loadingMeals = true;
    });
    try {
      final response = await ApiService.apiRequest(
        '/api/meals',
        context: context,
        method: 'GET',
      );
      if (response.statusCode == 200) {
        final List<dynamic> meals = jsonDecode(response.body);
        setState(() {
          _meals = meals.map((meal) => FoodItem.fromJson(meal)).toList();
          _filteredMeals = _meals;
        });
      } else {
        throw Exception('Failed to load meals');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _loadingMeals = false;
      });
    }
  }

  void _filterMeals() {
    String searchText = _searchController.text.toLowerCase();
    setState(() {
      _filteredMeals = _meals.where((meal) {
        bool matchesCategory = _selectedCategory == 'All' || meal.category.name == _selectedCategory;
        bool matchesSearch = meal.name.toLowerCase().contains(searchText);
        return matchesCategory && matchesSearch;
      }).toList();
    });
  }

  void _incrementQuantity(FoodItem meal) {
    setState(() {
      _cart[meal] = (_cart[meal] ?? 0) + 1;
    });
  }

  void _decrementQuantity(FoodItem meal) {
    if ((_cart[meal] ?? 0) > 0) {
      setState(() {
        _cart[meal] = _cart[meal]! - 1;
      });
    }
  }

  Future<void> _saveOrder() async {
    final List<Map<String, dynamic>> mealData = _cart.entries
        .where((entry) => entry.value > 0)
        .map((entry) => {
      'meal': entry.key.id,
      'quantity': entry.value
    })
        .toList();

    final orderData = {
      'table': table.id,
      'meals': mealData,
      'notes': _notes,
    };

    try {
      final response = await ApiService.apiRequest(
        '/api/orders',
        context: context,
        method: 'POST',
        data: orderData,
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Center(child: Text('Order saved successfully!'))),
        );
        _clearCart();
        Navigator.pop(context);
      } else {
        print(response.body);
        throw Exception('Failed to save order: ${response.body}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  void _clearCart() {
    setState(() {
      _cart.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Meals', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                labelText: 'Search meals',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),
          _buildCategoryTabs(),
          Expanded(
            child: _loadingMeals
                ? Center(child: CircularProgressIndicator())
                : GridView.builder(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 3 / 4,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: _filteredMeals.length,
              itemBuilder: (context, index) {
                final meal = _filteredMeals[index];
                return _buildMealCard(meal);
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  onPressed: _clearCart,
                  child: Text('Cancel'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
                ),
                ElevatedButton(
                  onPressed: _saveOrder,
                  child: Text('Save'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddNotesModal,
        child: Icon(Icons.note_add, color: Colors.white),
        backgroundColor: Colors.pink[900],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  void _showAddNotesModal() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                onChanged: (value) {
                  _notes = value;
                },
                decoration: InputDecoration(
                  labelText: 'Add Notes',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('Save'),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCategoryTabs() {
    final categories = ['All', 'Starters', 'Main Dishes', 'Desserts', 'Drinks'];
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: categories.map((category) {
            return GestureDetector(
              onTap: () {
                setState(() {
                  _selectedCategory = category;
                  _filterMeals();
                });
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 8.0),
                padding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                decoration: BoxDecoration(
                  color: _selectedCategory == category
                      ? Colors.pink[900]
                      : Colors.grey[300],
                  borderRadius: BorderRadius.circular(20.0),
                ),
                child: Text(
                  category,
                  style: TextStyle(
                    color: _selectedCategory == category
                        ? Colors.white
                        : Colors.black,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildMealCard(FoodItem meal) {
    return Card(
      elevation: 3,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Text(meal.name, style: TextStyle(fontWeight: FontWeight.bold)),
      Expanded(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.network(
            '$baseUrl/images/${meal.imageUrl}',
            width: double.infinity,
            height: 200,
            fit: BoxFit.cover,
          ),
        ),
      ),
          Text('${meal.price} €'),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.remove),
                onPressed: () => _decrementQuantity(meal),
              ),
              Text('${_cart[meal] ?? 0}'),
              IconButton(
                icon: Icon(Icons.add),
                onPressed: () => _incrementQuantity(meal),
              ),
            ],
          ),
        ],
      ),
    );
  }
}