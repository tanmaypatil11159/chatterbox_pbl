#  ChatterBox : Real-Time Communication Platform

ChatterBox is a fully responsive, feature-rich real-time messaging application with a playful "cartoon-wizard" aesthetic. Built with the MERN stack (MongoDB, Express, React, Node.js) and enhanced with Socket.io for instantaneous interactions, it offers a seamless experience across mobile, tablet, and desktop devices.

#Deployed Link
https://chatterbox-pbl-2.vercel.app/

##  Key Features

- **Real-Time Messaging**: Instant private and group chat powered by Socket.io.
- **Dynamic Rooms**: Create temporary or permanent chat rooms with expiry times, member limits, and password protection.
- **Interactive Dashboard**: Track your activity with visual charts and quick-access stat cards.
- **Connect & Friends**: Add friends via search or instant **QR Code Scanning**.
- **Responsive Design**: Optimized for all screen sizes (320px to 1440px+) using Tailwind CSS.
- **Notifications**: Real-time alerts for friend requests, room invites, and new messages.
- **Profile Customization**: Personalize your wizard identity with profile pictures (Cloudinary) and bios.
- **Theme Support**: Choose from multiple pre-defined themes with dynamic UI updates.
- **AI-Powered Summaries**: Get quick summaries of long chat room conversations.

##  Tech Stack

### **Frontend**
- **React 19 (Vite)**: Fast and efficient UI rendering.
- **Tailwind CSS 4**: Utility-first styling for high-performance responsive layouts.
- **Lucide React**: Modern, consistent iconography.
- **Socket.io Client**: For real-time event handling.
- **Zustand & Context API**: State management and global data sharing.
- **Framer Motion & Lottie**: Smooth animations and interactive elements.
- **Recharts**: Data visualization for the user dashboard.

### **Backend**
- **Node.js & Express**: Robust and scalable server-side architecture.
- **MongoDB & Mongoose**: Flexible NoSQL database for users, messages, and rooms.
- **Socket.io**: Real-time bidirectional event-based communication.
- **Cloudinary**: Cloud-based image management for profile and chat media.
- **JWT & BcryptJS**: Secure authentication and password hashing.
- **Nodemailer**: For email-based system notifications (if applicable).

---


##  Installation & Setup

### **Prerequisites**
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account

### **1. Clone the repository**
```bash
git clone <repository-url>
cd chatapp
```

### **2. Server Setup**
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5001
```
Start the server:
```bash
npm run server
```

### **3. Client Setup**
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` folder:
```env
VITE_BACKEND_URL=http://localhost:5001
```
Start the client:
```bash
npm run dev
```

---

##  Responsive Implementation

The application uses a mobile-first approach with the following breakpoints:
- **Mobile (320px - 480px)**: Collapsible sidebar (hamburger), single-column dashboard, full-width chat bubbles.
- **Tablet (768px)**: 2-column grids for cards and dashboard widgets, toggleable sidebars.
- **Desktop (1024px+)**: Fixed sidebar with navigation, multi-column layouts, full-width dashboard stats.

---

##  Security

- **JWT Authentication**: Secure access to protected routes.
- **Password Hashing**: BcryptJS for sensitive data protection.
- **Access Control**: Role-based permissions for room admins and members.
- **Input Sanitization**: Server-side validation for all user-generated content.

---

##  License
Distributed under the ISC License.
