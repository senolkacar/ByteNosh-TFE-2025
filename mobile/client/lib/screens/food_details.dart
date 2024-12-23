import 'package:flutter/material.dart';
import '/models/food_item.dart';
import '/constants/api_constants.dart';

class AddItemModal extends StatelessWidget {
  final FoodItem foodItem;

  const AddItemModal({Key? key, required this.foodItem}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 20),
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    '$baseUrl/images/${foodItem.imageUrl}',
                    width: double.infinity,
                    height: 200,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 10),
          Row(
            children: [
              // Vegetarian Badge
              if (foodItem.vegetarian && !foodItem.category.name.toLowerCase().contains('drink'))
                Chip(
                  avatar: Icon(
                    Icons.eco,
                    color: Colors.green[800],
                  ),
                  label: Text(
                    'Vegetarian',
                    style: TextStyle(color: Colors.green[800]),
                  ),
                  backgroundColor: Colors.green[100],
                ),
              SizedBox(width: 8),
              // Vegan Badge
              if (foodItem.vegan && !foodItem.category.name.toLowerCase().contains('drink'))
                Chip(
                  avatar: Icon(
                    Icons.eco,
                    color: Colors.green[800],
                  ),
                  label: Text(
                    'Vegan',
                    style: TextStyle(color: Colors.green[800]),
                  ),
                  backgroundColor: Colors.green[100],
                ),
            ],
          ),
          SizedBox(height: 10),
          Text(
            foodItem.name,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            '${foodItem.price}€',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            foodItem.description,
            style: TextStyle(
              fontSize: 16,
            ),
          ),
          Spacer(),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: Size(double.infinity, 50),
              foregroundColor: Colors.white,
              backgroundColor: Colors.pink[900],
            ),
            onPressed: () {
              Navigator.pop(context);
            },
            child: Text('Close'),
          ),
        ],
      ),
    );
  }
}
