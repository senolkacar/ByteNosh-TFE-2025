import 'package:flutter/material.dart';

class SideDrawer extends StatelessWidget {
  final Function(String) onCategorySelected;

  const SideDrawer({Key? key, required this.onCategorySelected}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: Colors.blueGrey[700],
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blueGrey[900],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    children: [
                      Icon(
                        Icons.keyboard_backspace,
                        size: 40,
                        color: Colors.white,
                      ),
                      SizedBox(height: 10),
                      Text(
                        'BACK',
                        style: TextStyle(fontSize: 20, color: Colors.white),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      Icon(
                        Icons.back_hand,
                        size: 40,
                        color: Colors.white,
                      ),
                      SizedBox(height: 10),
                      Text(
                        'REQUEST WAITER',
                        style: TextStyle(fontSize: 20, color: Colors.white),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.local_bar, color: Colors.white),
              title: const Text('DRINKS', style: TextStyle(color: Colors.white)),
              onTap: () {
                onCategorySelected('DRINKS');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.fastfood, color: Colors.white),
              title: const Text('STARTERS', style: TextStyle(color: Colors.white)),
              onTap: () {
                onCategorySelected('STARTERS');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.restaurant, color: Colors.white),
              title: const Text('MAIN DISHES', style: TextStyle(color: Colors.white)),
              onTap: () {
                onCategorySelected('MAIN DISHES');
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.cake, color: Colors.white),
              title: const Text('DESSERTS', style: TextStyle(color: Colors.white)),
              onTap: () {
                onCategorySelected('DESSERTS');
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
