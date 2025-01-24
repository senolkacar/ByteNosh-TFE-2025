# **ByteNosh - A multi-device restaurant management system**

## **Overview**

This is a multi-device restaurant application developed as part of my Bachelor's thesis in Software Development at EPFC. The project leverages the MERN stack (MongoDB, Express.js, React, and Node.js) with additional technologies like Next.js and TypeScript. There is also a mobile part developed in Flutter for the client and waitress. The application is designed to optimize restaurant operations by enabling table reservations, order history tracking, and more.

## **Features**

Table Reservation: Customers can reserve tables.

Waitlist System: Join a waitlist when all sections are fully booked for a specific date and timeslot. Customers are notified by mail if a table becomes available. (Cron job is set to check availability of tables).

Orders: Waitress can encode orders, manage tables and ask for payment via it's mobile application. Order history is kept logged.

QR Code System: Generate QR codes for reservation details, which employees can scan to verify reservations.

The website is developed in a modular concept, it is configurable via admin panel.

## **Technologies Used**

### **Frontend:**

Next.js (React framework)

TypeScript

Tailwind CSS

Shadcn UI components

### **Backend:**

Node.js with Express.js

MongoDB

TypeScript

### **Mobile:**

Flutter
