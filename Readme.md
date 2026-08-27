# YouTube Clone — Full Stack MERN

A full-stack **YouTube like platform** built with the **MERN stack**. The application allows users to upload and manage videos, interact with content, subscribe to channels, create playlists, maintain watch history, publish posts, and manage their channel through a dedicated dashboard. also i have access of Super admin from that i can access all over the project.

The project focuses on building a production-style full-stack application with **authentication, authorization, REST APIs, MongoDB relationships, file uploads, real-time functionality, and responsive frontend architecture**.

---

### Live Demo: [Click Here](https://full-stack-youtube-clone-2.onrender.com)

### Source Code: [Click Here](https://github.com/Coder-Abbas/Full-Stack-Youtube-Clone/)

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Secure password hashing
* Logout functionality
* Protected routes
* Authentication middleware
* Role-based access control (RBAC)
* User profile management
* Avatar management

---

### 👤 User & Channel

* User profiles
* Channel information
* Update channel details
* comments & liked videos
* Profile/avatar updates
* Subscriber count
* Subscribed channels
* Real-time subscription updates
* Prevent users from subscribing to themselves

---

### 🎥 Video System

* Upload videos
* Upload video thumbnails
* Video title and description
* Video duration
* Publish/unpublish videos
* Edit video information
* Delete videos
* Display published videos
* Video owner authorization
* View counting
* Video details page
* Home page infinite scroll & Random video on every load

---

### ❤️ Video Interaction

* Like/unlike videos
* Get liked videos
* Comments on videos
* Like/unlike comments
* View comments
* Delete/manage own comments

---

### 🔔 Subscription System

* Subscribe/unsubscribe to channels
* Display subscriber count
* Display subscribed channels
* Prevent self-subscription
* Real-time subscription updates

---

### 📺 Watch History

* Automatically track watched videos
* Store watch history
* Display previously watched videos
* Store watch timestamps

---

### ⏰ Watch Later

* Add videos to Watch Later
* Remove videos from Watch Later
* Display Watch Later videos

---

### 📂 Playlists

* Create playlists
* Add videos to playlists
* Remove videos from playlists
* View playlist videos
* Manage personal playlists

---

### 📊 Channel Dashboard

A dedicated channel administration dashboard for creators.

* Channel statistics
* Video management
* Subscriber statistics
* Subscriber/subscribed-to information
* Video views
* Published/unpublished videos
* Analytics + graphs
* Channel information management

---


## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* Tailwind CSS
* React Router
* Zustand
* Axios
* Recharts
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* Vite
* npm

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │       Client        │
                    │      React.js       │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │      Express.js     │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌─────────────────────────────────┐
              │                                 │
              ▼                                 ▼
        Authentication                     Controllers
              │                                 │
              └─────────────────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │      MongoDB        │
                    │     Mongoose        │
                    └─────────────────────┘
```



## 🔑 Core API Modules

The backend is organized around multiple REST API modules.

| Module         | Functionality                                       |
| -------------- | --------------------------------------------------- |
| Authentication | Register, login, logout, user authentication        |
| Users          | User profiles and user information                  |
| Videos         | Upload, publish, update, delete and retrieve videos |
| Likes          | Video likes and liked videos                        |
| Comments       | Video comments and interactions                     |
| Subscriptions  | Subscribe/unsubscribe and subscriber data           |
| Playlists      | Playlist creation and video management              |
| Watch History  | Track and retrieve watched videos                   |
| Watch Later    | Save videos for later                               |
| Posts          | Community posts and interactions                    |
| Dashboard      | Channel analytics and management                    |

---

## 🔐 Security

Security was considered throughout the backend architecture.

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Authentication middleware
* Authorization checks
* Resource ownership validation
* Role-based access control
* Prevent unauthorized video modification
* Prevent unauthorized deletion
* Prevent users from subscribing to themselves
* Environment variables for sensitive configuration

---

## 🔄 Application Flow

A typical authenticated request follows this flow:

```text
User
 │
 ▼
React Frontend
 │
 ▼
Axios Request
 │
 ▼
JWT Authentication
 │
 ▼
Express Middleware
 │
 ▼
Authorization
 │
 ▼
Controller
 │
 ▼
Mongoose
 │
 ▼
MongoDB
 │
 ▼
Response
 │
 ▼
React / Zustand
 │
 ▼
UI Update
```

---


## 🧪 API Testing

The backend APIs can be tested using tools such as:

* Postman
* Thunder Client

Authentication-protected endpoints require a valid JWT.

---

## 📱 Responsive UI

The frontend is designed to provide a responsive experience across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The UI follows a YouTube-inspired layout with:

* Navbar
* Sidebar
* Video grid
* Video player
* Channel pages
* Profile pages
* Dashboard
* Responsive navigation

---

## 🧠 What I Learned

This project helped me gain practical experience with:

* MERN stack development
* REST API architecture
* React component architecture
* State management with Zustand
* JWT authentication
* Authorization and RBAC
* MongoDB data modeling
* Mongoose relationships and population
* File uploads
* CRUD operations
* Protected routes
* API error handling
* Frontend/backend integration
* Git and GitHub
* Deployment concepts
* Dashboard and analytics development

---

## 🔮 Future Improvements

---

## 🎯 Project Goal

The main goal of this project was to move beyond simple CRUD applications and build a **complete production-style MERN application** involving authentication, authorization, relationships between multiple MongoDB collections, file handling, real-time communication, state management, and creator analytics.

---

## 👨‍💻 Author

**Muhammad Abbas**

Computer Science Student
MERN Stack Developer

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

made with **❤️ by Muhammad Abbas Computer Science Student at Quaid e Azam University Islamabad**.
