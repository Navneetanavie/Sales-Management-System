# Architecture Document

## Backend Architecture
The backend is built using **Node.js** and **Express.js**, following a layered architecture pattern.
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (persistent file storage)
- **ORM**: Sequelize (for schema definition and query abstraction)
- **Module System**: ES Modules (`import`/`export`)

The backend exposes a RESTful API consumed by the frontend. It handles data processing, filtering, and aggregation on the server side to minimize data transfer and frontend load.

## Frontend Architecture
The frontend is a Single Page Application (SPA) built with **React**.
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with a component-based structure
- **State Management**: React Hooks (`useState`, `useEffect`)
- **Routing**: Client-side routing (if applicable, currently single view)

The frontend is designed to be responsive and interactive, providing real-time feedback as users apply filters or search.

## Data Flow
1.  **User Interaction**: User interacts with the UI (e.g., selects a region filter).
2.  **API Request**: Frontend constructs a query string (e.g., `?region=East`) and sends a `GET` request to `/api/sales`.
3.  **Route Handling**: Express router receives the request and directs it to the `SalesController`.
4.  **Controller**: `SalesController` extracts query parameters and calls `SalesService`.
5.  **Service Layer**: `SalesService` builds a Sequelize query with appropriate `WHERE` clauses and `ORDER BY` options.
6.  **Database Query**: Sequelize executes the SQL query against the SQLite database.
7.  **Response**: Data is returned to the Service, then Controller, and sent back to the Frontend as JSON.
8.  **UI Update**: Frontend updates the state with new data and re-renders the dashboard.

## Folder Structure

```
SalesMS/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── data/           # Raw data files (sales_data.csv)
│   │   ├── models/         # Sequelize models (Sale.js)
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic and DB interactions
│   │   └── index.js        # Entry point
│   ├── database.sqlite     # SQLite database file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API client services
│   │   ├── App.js          # Main application component
│   │   └── index.css       # Global styles
│   └── package.json
└── docs/
    └── architecture.md     # This document
```

## Module Responsibilities

### Backend
- **`index.js`**: Initializes the Express app, middleware (CORS, JSON), and starts the server.
- **`config/database.js`**: Configures the Sequelize instance and connection to the SQLite database.
- **`models/Sale.js`**: Defines the database schema for sales transactions, including data types and indexes.
- **`routes/salesRoutes.js`**: Maps HTTP endpoints (e.g., `/`, `/filters`) to controller functions.
- **`controllers/salesController.js`**: Handles incoming HTTP requests, validates input, and sends HTTP responses.
- **`services/salesService.js`**: Contains the core business logic. Handles data import, query construction, filtering, sorting, and aggregation.

### Frontend
- **`api.js`**: Abstraction layer for making HTTP requests to the backend.
- **`App.js`**: Main container component that manages application state (filters, data, pagination) and layout.
- **`components/`**: Contains presentation components like `FilterBar`, `StatsCard`, `TransactionTable`, etc., responsible for rendering specific parts of the UI.
