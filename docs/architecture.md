# System Architecture

## Backend Architecture
The backend is built with **Node.js** and **Express**, following a service-oriented architecture.
- **Entry Point**: `src/index.js` initializes the server and middleware.
- **Routes**: `src/routes/salesRoutes.js` defines the API endpoints (e.g., `/api/sales`, `/api/filters`).
- **Services**: Business logic is encapsulated in services to keep controllers lean.
  - `salesService.js`: Handles data processing, filtering, sorting, and pagination.
  - `googleDriveService.js`: Manages authentication and data fetching from Google Drive.

## Frontend Architecture
The frontend is a **React** Single Page Application (SPA) initialized with **Vite**.
- **Component-Based**: UI is broken down into reusable components (`Sidebar`, `StatsCards`, `TransactionTable`, etc.).
- **State Management**: Uses React Hooks (`useState`, `useEffect`) for managing local state (sales data, filters, pagination).
- **Styling**: Global styles are defined in `index.css` using vanilla CSS with a focus on flexbox layouts.

## Data Flow
1. **Request**: Frontend initiates a request (e.g., user changes a filter).
2. **API Call**: `App.jsx` calls `fetchSales()` in `api.js`.
3. **Route Handling**: Express router directs the request to `salesController` (implicit in routes).
4. **Data Retrieval**: `salesService` requests data. If not cached, `googleDriveService` fetches the CSV from Google Drive.
5. **Processing**: `salesService` parses the CSV, applies search/filters/sort, calculates stats, and paginates the result.
6. **Response**: JSON response containing data and metadata is sent back to the Frontend.
7. **Render**: React updates the state and re-renders the UI components.

## Folder Structure
```
SalesMS/
├── backend/
│   ├── src/
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic & data fetching
│   │   ├── utils/          # Helper functions (formatting, etc.)
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API client functions
│   │   ├── App.jsx         # Main application component
│   │   └── index.css       # Global styles
│   └── package.json
└── docs/
    └── architecture.md     # This documentation
```

## Module Responsibilities
- **App.jsx**: Main controller. Orchestrates state, handles callbacks for search/filter/sort, and manages the layout.
- **Sidebar.jsx**: Navigation component with collapsible sections.
- **StatsCards.jsx**: Displays summary statistics (Total Units, Amount, Discount).
- **TransactionTable.jsx**: Renders the sales data in a tabular format.
- **salesService.js (Backend)**: The core logic engine. It is responsible for the integrity of the data presentation (filtering, sorting, math).
- **googleDriveService.js (Backend)**: Abstraction layer for the data source. It handles the complexity of the Google Drive API.
