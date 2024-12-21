
class Category {
  final String id;
  final String name;
  final String description;
  final String imageUrl;

  Category({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'],
      name: json['name'],
      description: json['description'],
      imageUrl: json['image'],
    );
  }
}