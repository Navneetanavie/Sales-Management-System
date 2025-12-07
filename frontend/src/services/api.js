const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/sales';

export const fetchSales = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}?${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales data');
  }
  return response.json();
};

export const fetchFilters = async () => {
  const response = await fetch(`${API_BASE_URL}/filters`);
  if (!response.ok) {
    throw new Error('Failed to fetch filter options');
  }
  return response.json();
}
