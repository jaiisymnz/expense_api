# Expense Tracker API

## Project Overview

The **Expense Tracker API** is a RESTful API designed for managing personal expenses. The API allows users to register, log in, and perform CRUD (Create, Read, Update, Delete) operations on their expenses. The API also supports generating reports based on the user's expenses and provides secure JWT-based authentication.

## Features

1. **User Management**:
   - User registration with email and password.
   - Secure JWT-based authentication.
   - Login functionality to generate a JWT token for subsequent requests.
   - Protect API endpoints with JWT-based authentication.

2. **Expense Management**:
   - Users can create an expense with the following fields:
     - Title (e.g., "Grocery Shopping")
     - Amount (e.g., 100.00)
     - Date of the expense
     - Category (e.g., "Food", "Transportation")
     - Notes (optional)
   - CRUD operations for expenses:
     - **Create**: Add a new expense.
     - **Read**: Retrieve a list of all expenses for the authenticated user, supporting filtering by date range and category.
     - **Update**: Modify an existing expense.
     - **Delete**: Remove an expense.
   - Ensure that each user can only manage their own expenses.

3. **Reporting**:
   - Generate a report of total expenses per category for a given date range.

4. **Bonus Features**:
   - Pagination for listing expenses.
   - Unit tests for key functionalities.
   - Docker containerization.
   - Cloud deployment (e.g., Heroku, AWS, GCP).

## Technology Stack

- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **Version Control**: Git (GitHub)

## Setup Instructions

- Postgresql query provided in file query.txt
