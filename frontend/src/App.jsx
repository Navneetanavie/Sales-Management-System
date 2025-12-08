import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import SortControl from './components/SortControl';
import TransactionTable from './components/TransactionTable';
import Pagination from './components/Pagination';
import StatsCards from './components/StatsCards';
import { fetchSales, fetchFilters } from './services/api';
import './index.css';

import Sidebar from './components/Sidebar';

function App() {
  const [salesData, setSalesData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    totalUnits: 0,
    totalAmount: 0,
    count: 0
  });

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadSales();
  }, [search, filters, sortBy, page]);

  const loadFilters = async () => {
    try {
      const options = await fetchFilters();
      setFilterOptions(options);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        ...filters,
        sortBy,
        page,
        limit: 15
      };


      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const data = await fetchSales(params);
      setSalesData(data.data || []);
      setStats(data.stats || {});
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    setSearch('');
    setFilters({});
    setSortBy('date');
    setPage(1);
  };

  return (
    <div className="app-container">
      <Sidebar />

      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">Sales Management System</h1>
          <div className="top-controls">
            <SearchBar onSearch={handleSearch} initialValue={search} />
          </div>
        </header>

        <div className="filters-row">
          <button className="refresh-btn" onClick={handleRefresh} title="Reset Filters">
            ↻
          </button>
          <FilterBar
            filters={filters}
            options={filterOptions}
            onFilterChange={handleFilterChange}
          />
          <div className="spacer"></div>
          <SortControl sortBy={sortBy} onSortChange={handleSortChange} />
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="content-area">
          {loading ? (
            <div className="loading">Loading data...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <TransactionTable data={salesData} />
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
