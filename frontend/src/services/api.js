const API_URL = 'http://localhost:5000';

const getHeaders = (token) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        const error = (data && data.error) || response.statusText;
        throw new Error(error);
    }
    return data;
};

export const api = {
    post: async (endpoint, body, token = null) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    get: async (endpoint, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(token),
        });
        return handleResponse(response);
    }
};
