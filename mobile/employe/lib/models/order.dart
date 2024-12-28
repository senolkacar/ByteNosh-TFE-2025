class Order {
  String? id;
  String? table;
  List<String>? meals;
  String? user;
  DateTime? date;
  String? status;
  String? reservation;
  DateTime? createdAt;
  String? notes;

  Order({
    this.id,
    this.table,
    this.meals,
    this.user,
    this.date,
    this.status,
    this.reservation,
    this.createdAt,
    this.notes,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'],
      table: json['table'],
      meals: List<String>.from(json['meals'] ?? []),
      user: json['user'],
      date: json['date'] != null ? DateTime.parse(json['date']) : null,
      status: json['status'],
      reservation: json['reservation'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'table': table,
      'meals': meals,
      'user': user,
      'date': date?.toIso8601String(),
      'status': status,
      'reservation': reservation,
      'createdAt': createdAt?.toIso8601String(),
      'notes': notes,
    };
  }
}