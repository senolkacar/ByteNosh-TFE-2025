"use client";

export default function Footer(){
    return (
        <footer className="bg-black text-white py-10 rounded">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
                {/* About Section */}
                <div>
                    <h2 className="font-semibold text-lg mb-4">About Restaurant</h2>
                    <p className="text-gray-400">
                        Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or
                        a typeface without relying on meaningful content.
                    </p>
                    <div className="flex justify-center md:justify-start mt-4">
                        {/* Social icons */}
                        <a href="#" className="text-gray-400 hover:text-white mx-2">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white mx-2">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white mx-2">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white mx-2">
                            <i className="fab fa-twitter"></i>
                        </a>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div>
                    <h2 className="font-semibold text-lg mb-4">Quick Links</h2>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Menu</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Testimonial</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                    </ul>
                </div>

                {/* Our Menu Section */}
                <div>
                    <h2 className="font-semibold text-lg mb-4">Our Menu</h2>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">Burger</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Desserts</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Pizza</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Pasta</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Kabab</a></li>
                    </ul>
                </div>

                {/* My Account Section */}
                <div>
                    <h2 className="font-semibold text-lg mb-4">My Account</h2>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white">Account</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Shipping</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Order Status</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Shopping Cart</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white">Our Shop</a></li>
                    </ul>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
                <p>Copyright © 2024 Senol Kaçar  All Rights Reserved.</p>
            </div>
        </footer>
    );

}