import 'package:flutter/material.dart';
import '/services/api_service.dart';
import 'dart:convert';
import '/models/food_item.dart';
import '/constants/api_constants.dart';

class EditOrderScreen extends StatefulWidget {
  final Map<String, dynamic> order;

  EditOrderScreen({required this.order});

  @override
  _EditOrderScreenState createState() => _EditOrderScreenState();
}

class _EditOrderScreenState extends State<EditOrderScreen> {
  late Map<String, dynamic> initialOrder;
  late Map<String, dynamic> _modifiedOrder;
  List<int> quantities = [];
  TextEditingController _notesController = TextEditingController();
  List<FoodItem> _meals = [];
  List<FoodItem> _filteredMeals = [];
  bool _loadingMeals = true;
  TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    initialOrder = jsonDecode(jsonEncode(widget.order));
    _modifiedOrder = jsonDecode(jsonEncode(widget.order));
    _notesController.text = _modifiedOrder['notes'] ?? '';
    if (widget.order['meals'] != null) {
      quantities = List.generate(widget.order['meals'].length, (index) => widget.order['meals'][index]['quantity']);
    }
    _fetchMeals();
    _searchController.addListener(_filterMeals);
  }

  @override
  void dispose() {
    _notesController.dispose();
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
        return meal.name.toLowerCase().contains(searchText);
      }).toList();
    });
  }

  void _incrementQuantity(int index) {
    if (index >= 0 && index < quantities.length) {
      setState(() {
        quantities[index]++;
      });
    }
  }

  void _decrementQuantity(int index) {
    if (index >= 0 && index < quantities.length && quantities[index] > 1) {
      setState(() {
        quantities[index]--;
      });
    }
  }

  Future<void> _saveOrderChanges() async {
    for (int i = 0; i < _modifiedOrder['meals'].length; i++) {
      _modifiedOrder['meals'][i] = {
        'meal': _modifiedOrder['meals'][i]['_id'],
        'quantity': quantities[i]
      };
    }
    _modifiedOrder['notes'] = _notesController.text;

    final response = await ApiService.apiRequest(
      '/api/orders/${widget.order['_id']}',
      context: context,
      method: 'PUT',
      data: _modifiedOrder,
    );

    if (response.statusCode == 200) {
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update order')),
      );
    }
  }

  void _deleteMeal(int index) {
    if (index >= 0 && index < _modifiedOrder['meals'].length) {
      setState(() {
        _modifiedOrder['meals'].removeAt(index);
        quantities.removeAt(index);
      });
    }
  }

  void _cancelChanges() {
    setState(() {
      _modifiedOrder = jsonDecode(jsonEncode(initialOrder));
      quantities = List.generate(_modifiedOrder['meals'].length, (index) => _modifiedOrder['meals'][index]['quantity']);
      _notesController.text = _modifiedOrder['notes'] ?? '';
    });
  }

  void _showAddMealModal() {
    List<FoodItem> availableMeals = _meals.where((meal) {
      return !_modifiedOrder['meals'].any((orderMeal) => orderMeal['_id'] == meal.id);
    }).toList();

    TextEditingController searchController = TextEditingController();
    List<FoodItem> modalFilteredMeals = List.from(availableMeals);

    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: StatefulBuilder(builder: (context, modalSetState) {
            searchController.addListener(() {
              String searchText = searchController.text.toLowerCase();
              modalSetState(() {
                modalFilteredMeals = availableMeals.where((meal) {
                  return meal.name.toLowerCase().contains(searchText);
                }).toList();
              });
            });

            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: searchController,
                  decoration: InputDecoration(
                    labelText: 'Search meals',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
                SizedBox(height: 10),
                Expanded(
                  child: modalFilteredMeals.isEmpty
                      ? Center(child: Text("No meals available"))
                      : ListView.builder(
                    shrinkWrap: true,
                    itemCount: modalFilteredMeals.length,
                    itemBuilder: (context, index) {
                      final meal = modalFilteredMeals[index];
                      return ListTile(
                        title: Text(meal.name),
                        subtitle: Text('${meal.price} €'),
                        trailing: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _modifiedOrder['meals'].add({
                                '_id': meal.id,
                                'name': meal.name,
                                'price': meal.price,
                                'quantity': 1,
                              });
                              quantities.add(1);
                            });
                            Navigator.pop(context);
                          },
                          child: Text('Add'),
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          }),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.pink[900],
        backgroundColor: Colors.grey[200],
        title: Text('Edit Order', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order ID: ${widget.order['_id']}', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            SizedBox(height: 16),
            Text('Meals:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Expanded(
              child: ListView.builder(
                itemCount: _modifiedOrder['meals'].length,
                itemBuilder: (context, index) {
                  final meal = _modifiedOrder['meals'][index];
                  return Card(
                    margin: EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(meal['name'], style: TextStyle(fontSize: 16)),
                              Text('Price: ${meal['price'].toStringAsFixed(2)} €', style: TextStyle(color: Colors.grey[600])),
                            ],
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon: Icon(Icons.remove, color: Colors.red),
                                onPressed: quantities[index] > 1 ? () => _decrementQuantity(index) : null,
                              ),
                              Text('${quantities[index]}', style: TextStyle(fontSize: 16)),
                              IconButton(
                                icon: Icon(Icons.add, color: Colors.green),
                                onPressed: () => _incrementQuantity(index),
                              ),
                              IconButton(
                                icon: Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _deleteMeal(index),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            TextField(
              controller: _notesController,
              decoration: InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton(
                  onPressed: _cancelChanges,
                  child: Text('Cancel', style: TextStyle(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: _modifiedOrder['meals'].isEmpty ? null : _saveOrderChanges,
                  child: Text('Save', style: TextStyle(color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddMealModal,
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.pink[900],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}