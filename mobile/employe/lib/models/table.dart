class TableInfo {
  final String id;
  final int number;
  final String name;
  final int seats;
  final String status;
  final String? section;

  TableInfo({
    required this.id,
    required this.number,
    required this.name,
    required this.seats,
    required this.status,
    this.section,
  });

  factory TableInfo.fromMap(Map<String, dynamic> map) {
    return TableInfo(
      id: map['_id'],
      number: map['number'],
      name: map['name'],
      seats: map['seats'],
      status: map['status'],
      section: map['section'],
    );
  }
  TableInfo copyWith({String? status}) {
    return TableInfo(
      id: id,
      number: number,
      name: name,
      seats: seats,
      status: status ?? this.status,
    );
  }
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'number': number,
      'name': name,
      'seats': seats,
      'status': status,
    };
  }
}