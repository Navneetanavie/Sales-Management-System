# Sales Management System

## Overview
A robust Sales Management System designed to visualize and manage sales transactions efficiently. It features a responsive dashboard with key performance indicators, detailed transaction logs, and a sidebar navigation system. The application seamlessly integrates with Google Drive to fetch and process sales data in real-time.

## Tech Stack
- **Frontend**: React, Vite, CSS (Vanilla)
- **Backend**: Node.js, Express
- **Data**: Google Drive API, CSV Parsing (csv-parse)
- **Tools**: Axios, Lucide React (Icons)

## Search Implementation Summary
Search functionality is handled server-side in `salesService.js`. The system filters the dataset by checking if the search term is included in either the `Customer Name` (case-insensitive) or `Phone No`. The frontend `SearchBar` component captures user input and triggers a data fetch with the `search` query parameter.

## Filter Implementation Summary
Filtering is implemented as a cumulative process in the backend. The `salesService` accepts a filter object (e.g., `{ "Customer Region": "East", "Gender": "Male" }`) and iterates through the data, keeping only records that match all active criteria. The frontend `FilterBar` dynamically generates dropdowns based on available data options.

## Sorting Implementation Summary
Sorting logic resides in the backend's `salesService`. It supports sorting by `Date`, `Total Amount`, `Quantity`, and `Customer Name`. The system parses dates and numeric values to ensure correct ordering (ascending or descending) before returning the sorted slice of data to the frontend.

## Pagination Implementation Summary
Server-side pagination is used to optimize performance. The backend accepts `page` and `limit` parameters to calculate the starting index and slice the data array accordingly. It returns the data subset along with `totalPages`, `currentPage`, and `totalRecords` metadata, which the frontend `Pagination` component uses to render numbered navigation controls.

## Setup Instructions
1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   Runs on `http://localhost:5001`.

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Accessible at the local Vite URL (usually `http://localhost:5173`).
