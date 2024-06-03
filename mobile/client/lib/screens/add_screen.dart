import 'package:flutter/material.dart';
import '/models/food_item.dart';

class AddItemModal extends StatelessWidget {
  final FoodItem foodItem;
  final String baseUrl = 'http://10.0.2.2:5000';

  const AddItemModal({Key? key, required this.foodItem}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    '$baseUrl${foodItem.imageUrl}',
                    width: double.infinity,
                    height: 50,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              SizedBox(width: 10),
              Text(
                foodItem.name,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Spacer(),
              Text(
                '${foodItem.price}€',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          Text(
            foodItem.description,
            style: TextStyle(
              fontSize: 16,
            ),
          ),
          Row(
            children:[
              Text(
                'Quantity:',style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              IconButton(
                color: Colors.red,
                icon: Icon(Icons.remove_circle),
                onPressed: (){},
              ),
              Text('1'),
              IconButton(
                color: Colors.green,
                icon: Icon(Icons.add_circle),
                onPressed: (){},
              ),
            ],
          ),
          Text(
            'Special Instructions:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
          TextField(
            decoration: InputDecoration(
              hintText: 'Add special instructions here',
              border: OutlineInputBorder(),
            ),
          ),
          Spacer(),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: Size(double.infinity, 50),
             foregroundColor: Colors.white,
              backgroundColor: Colors.pink[900],
            ),
            onPressed: (){},
            child: Text('Add to Cart'),
          ),
        ],
      ),
    );
  }
}
