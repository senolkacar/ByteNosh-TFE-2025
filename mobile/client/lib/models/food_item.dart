import 'package:flutter/material.dart';

class FoodItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final bool vegetarian;
  final bool vegan;
  final String category;

  FoodItem({required this.id,required this.name, required this.description, required this.price, required this.imageUrl, required this.vegetarian, required this.vegan, required this.category});

  factory FoodItem.fromJson(Map<String, dynamic> json) {
    return FoodItem(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: json['price'],
      imageUrl: json['image'],
      vegetarian: json['vegetarian'],
      vegan: json['vegan'],
      category: json['category'],
    );
  }
}
