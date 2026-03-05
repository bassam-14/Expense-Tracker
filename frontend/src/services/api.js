const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Auto-Logout on Expired Token
const handleResponse = async (response) => {
    if (!response.ok) {
        // Only redirect to login if the error is 401 AND we aren't already trying to login
        if (response.status === 401 && !response.url.includes('/auth/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
        }

        // Throw the error so your catch block in handleSubmit can catch it
        const errorData = await response.json();
        throw new Error(errorData.message || 'API Error');
    }
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    return handleResponse(response);
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return handleResponse(response);
};

// --- EXPENSES ---
export const uploadReceipt = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/expenses/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // Never manually set Content-Type for FormData
    });
    return handleResponse(response);
};

export const getExpense = async (expenseId, token) => {
    if (!token || token === "undefined" || token.split('.').length !== 3) {
        console.warn("Blocking API call: Token is missing or malformed.");
        return null;
    }
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const confirmExpense = async (expenseId, expenseData, token) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/confirm`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
};

export const getAllExpenses = async (token) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const deleteExpense = async (expenseId, token) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const createManualExpense = async (expenseData, token) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
    });
    return handleResponse(response);
};