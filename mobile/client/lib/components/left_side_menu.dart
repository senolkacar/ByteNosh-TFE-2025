import 'package:flutter/material.dart';
import '/screens/login_screen.dart';

class LeftSideMenu extends StatelessWidget {
  const LeftSideMenu({
    super.key,
    required this.userEmail,
  });

  final String userEmail;

  @override
  Widget build(BuildContext context) {
    return Drawer(
        child:ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              accountName: null,
              accountEmail: Text(userEmail, style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),),
              currentAccountPicture: CircleAvatar(
                child: Icon(Icons.person),
              ),
              decoration: BoxDecoration(
                color: Colors.pink[900],
              ),
            ),

            ListTile(
              leading: const Icon(Icons.person),
              title: const Text('Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              onTap:(){

              },
            ),
            ListTile(
                leading: const Icon(Icons.shopping_cart),
                title: const Text('Orders', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                onTap:(){

                }
            ),
            ListTile(
                leading: const Icon(Icons.favorite),
                title: const Text('Favorites', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                onTap:(){

                }
            ),
            ListTile(
                leading: const Icon(Icons.local_offer),
                title: const Text('Promotions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                onTap:(){

                }
            ),
            ListTile(
                leading: const Icon(Icons.info),
                title: const Text('About Us', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                onTap:(){

                }
            ),
            ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Settings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                onTap:(){

                }
            ),
            ListTile(
                title: const Text('Logout', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                leading: const Icon(Icons.logout),
                onTap:(){
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => LoginScreen()),
                  );
                }
            ),
          ],
        )
    );
  }
}