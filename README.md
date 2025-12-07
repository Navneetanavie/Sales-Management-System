# Sales Management System

## Overview
The Sales Management System is a full-stack web application designed to manage and visualize sales data. It provides a dashboard for viewing transaction details, filtering data by various criteria (region, gender, category, etc.), and analyzing sales performance through aggregated statistics. The system handles large datasets efficiently using a SQLite database.

## Tech Stack
- **Frontend**: React, Vite, CSS (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite, Sequelize ORM
- **Language**: JavaScript (ES Modules)

## Search Implementation Summary
Search functionality is implemented in the backend `SalesService`. It uses Sequelize's `Op.like` operator to perform case-insensitive partial matches on `customer_name` and `phone_number` fields. The search term is applied as an `OR` condition across these fields.

## Filter Implementation Summary
Filtering is handled dynamically in the backend. The `SalesService` constructs a `where` clause based on provided query parameters. Supported filters include:
- `region`, `gender`, `category`, `paymentMethod` (Exact match/IN clause)
- `minAge`, `maxAge` (Range comparison)
- `startDate`, `endDate` (Date range comparison)
- `tags` (Partial match using `Op.like`)

## Sorting Implementation Summary
Sorting is achieved via the `order` parameter in Sequelize queries. The API accepts a `sortBy` parameter (e.g., `date`, `quantity`, `customer_name`) and applies the corresponding column and direction (`ASC` or `DESC`) to the database query. Default sorting is by `date` in descending order.

## Pagination Implementation Summary
Server-side pagination is implemented using `limit` and `offset` in Sequelize. The frontend sends `page` and `limit` parameters. The backend calculates `offset = (page - 1) * limit` and returns the requested slice of data along with total count and total pages metadata.

## Setup Instructions
1.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    The server will start on port 5001 and automatically import data into `database.sqlite` if empty.

2.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.
