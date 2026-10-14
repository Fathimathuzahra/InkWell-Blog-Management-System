# InkWell – Blog Management System

## 📌 Project Overview

InkWell is a web-based Blog Management System that allows users to create, read, update, and delete blog posts. Users can register, log in securely, publish their own posts, read posts written by other users, and add comments.

The system includes authentication, authorization, input validation, and ownership-based permissions. Users can edit or delete only their own posts and comments, while administrators can manage users and content through the Django administration panel.

The project is developed using **React.js** for the frontend, **Django REST Framework** for the backend, and **MySQL** for database management.

## 🎯 Project Objectives

- Provide a platform for users to publish blog posts.
- Allow users to register and log in securely.
- Enable users to create, view, edit, and delete their own posts.
- Allow users to read posts published by other users.
- Provide a commenting system for blog posts.
- Ensure users can modify or delete only their own content.
- Validate user input and prevent invalid data.
- Provide administrators with user and content management functionality.
- Develop a responsive and user-friendly interface.
- Demonstrate frontend and backend integration using REST APIs.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Vite | Frontend development and build tool |
| JavaScript | Frontend functionality |
| HTML5 | Web page structure |
| CSS3 | Styling and responsive design |
| Python | Backend programming |
| Django | Backend framework |
| Django REST Framework | REST API development |
| MySQL | Database management |
| PyMySQL | MySQL connectivity |
| Simple JWT | Token-based authentication |
| Axios | Frontend API communication |
| Git | Version control |
| GitHub | Source code hosting |
| Vercel | Frontend deployment |

## ✨ Main Features

### 1. User Registration
- Users can create an account using a username, email address, and password.
- Registration data is validated.
- Duplicate usernames and email addresses are rejected.
- Passwords are stored using Django's password-hashing mechanism.

### 2. User Login
- Registered users can log in using their credentials.
- JWT access and refresh tokens are provided by the authentication API.
- The access token is used to access protected API endpoints.

### 3. Blog Post Management
Authenticated users can:
- Create blog posts.
- View all available posts.
- Read posts written by other users.
- Edit their own posts.
- Delete their own posts.

Each post contains a title, content, author, creation date, and last updated date.

### 4. Comment Management
Users can:
- Add comments to blog posts.
- View comments written by other users.
- Edit their own comments.
- Delete their own comments.

The backend checks ownership before allowing modifications.

### 5. Like Functionality
The backend includes a Like model to record users' likes on blog posts. A database constraint prevents the same user from liking the same post more than once.

### 6. Admin Management
Django provides an administration panel for authorized administrators to manage users and project data according to their permissions.

### 7. Search and Sorting
The frontend provides search and sorting functionality to help users find and organize blog posts.

### 8. User Interface
- Responsive web interface.
- Cream, navy, and antique-gold color scheme.
- Light and dark theme toggle.
- User-friendly blog management experience.

## 🏗️ System Architecture

InkWell follows a client-server architecture.

- **Frontend:** React.js provides the user interface.
- **Backend:** Django REST Framework processes requests, validates data, and applies permissions.
- **Database:** MySQL stores users, posts, comments, and likes.
- **Authentication:** JWT tokens authenticate API requests.
- **API Communication:** Axios connects the React frontend to the backend.

### System Workflow

1. A user opens the InkWell website.
2. The user registers or logs in.
3. The frontend sends a request to the backend API.
4. The backend validates the request and checks permissions.
5. The backend reads or updates the MySQL database.
6. The backend returns a JSON response.
7. The frontend displays the result.

## 🗄️ Database Design

InkWell uses MySQL as its relational database.

### 1. User

Django's built-in User model stores account information.

Important fields:
- `id` – Unique user identifier.
- `username` – Username.
- `email` – Email address.
- `password` – Hashed password.
- `is_active` – Indicates whether the account is active.
- `is_staff` – Indicates staff access to the Django admin site.
- `is_superuser` – Indicates superuser privileges.

### 2. Post

Stores blog posts.

| Field | Description |
|---|---|
| id | Unique post identifier |
| author_id | Reference to the post author |
| title | Blog post title |
| content | Blog post content |
| created_at | Creation date and time |
| updated_at | Last updated date and time |

**Relationship:** Each post belongs to one user. A user can create multiple posts.

### 3. Comment

Stores comments associated with blog posts.

| Field | Description |
|---|---|
| id | Unique comment identifier |
| post_id | Reference to the associated post |
| author_id | Reference to the comment author |
| content | Comment text |
| created_at | Creation date and time |
| updated_at | Last updated date and time |

**Relationships:**
- Each comment belongs to one post.
- Each comment belongs to one user.
- A post can have multiple comments.
- A user can write multiple comments.

### 4. Like

Stores users' likes on blog posts.

| Field | Description |
|---|---|
| id | Unique like identifier |
| post_id | Reference to the liked post |
| user_id | Reference to the user who liked the post |
| created_at | Creation date and time |

**Relationship:** A user can like multiple posts, and a post can receive likes from multiple users. A unique constraint prevents duplicate likes by the same user on the same post.

## 🔌 API Documentation

### Base URL

Local development API:

`http://127.0.0.1:8000/api/`

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/refresh/` | Refresh an access token |

### Blog Post APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts/` | Retrieve blog posts |
| POST | `/api/posts/` | Create a blog post |
| GET | `/api/posts/{id}/` | Retrieve a specific post |
| PUT | `/api/posts/{id}/` | Replace an existing post |
| PATCH | `/api/posts/{id}/` | Update selected post fields |
| DELETE | `/api/posts/{id}/` | Delete a blog post |

Creating, editing, and deleting posts requires authentication. Users must have permission to modify a post.

### Comment APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/` | Retrieve comments |
| POST | `/api/comments/` | Create a comment |
| GET | `/api/comments/{id}/` | Retrieve a specific comment |
| PUT | `/api/comments/{id}/` | Replace a comment |
| PATCH | `/api/comments/{id}/` | Update selected comment fields |
| DELETE | `/api/comments/{id}/` | Delete a comment |

Users must be authenticated to create comments. Editing and deleting comments are restricted by the configured ownership permissions.


