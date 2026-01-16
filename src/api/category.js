const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
const API_URL = `${BACKEND_URL}/api/v1/library/categories`;


const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
});


export async function getAllCategories(pageNumber = 1, pageSize = 100) {
  const response = await fetch(`${API_URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return await response.json();
}


export async function getCategoryById(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Category not found');
  return await response.json();
}


export async function createCategory(categoryData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) throw new Error('Failed to create category');
  return await response.json();
}


export async function updateCategory(id, categoryData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(categoryData)
  });
  if (!response.ok) throw new Error('Failed to update category');
  return await response.json();
}


export async function deleteCategory(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete category');
  return await response.json();
}

// Tải báo cáo Excel (Dashboard)
export async function downloadCategoryDashboard() {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });

  if (!response.ok) throw new Error('Failed to download report');


  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "categories_report.xlsx";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}