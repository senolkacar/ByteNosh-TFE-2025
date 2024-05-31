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
  final String categoryName;

  FoodItem({required this.id,required this.name, required this.description, required this.price, required this.imageUrl, required this.vegetarian, required this.vegan, required this.category,required this.categoryName});

  factory FoodItem.fromJson(Map<String, dynamic> json) {
    return FoodItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description']?? '',
      price: json['price'] ?? 0.0,
      imageUrl: json['image'] ?? '',
      vegetarian: json['vegetarian'] ?? false,
      vegan: json['vegan'] ?? false,
      category: json['category'] ?? '',
      categoryName: json['category_name'] ?? '',
    );
  }
}
