import 'package:flutter/material.dart';
import 'login_screen.dart';

class HomepageScreen extends StatelessWidget {
  final String userEmail;

  const HomepageScreen(
      {super.key,required this.userEmail}
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[300],
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      drawer: Drawer(
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
      ),
      body: const Center(
        child: Text(
          "THIS IS THE HOMEPAGE",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
        ),
      ),
    );
  }
}

