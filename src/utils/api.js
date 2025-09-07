import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

class ApiClient {
  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('authToken');
          throw new Error('Unauthorized');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authApi = {
  getUser: () => apiClient.get('/api/auth/user'),
  login: (token) => apiClient.post('/api/auth/login', { token }),
  logout: () => apiClient.post('/api/auth/logout'),
};

// Profile API
export const profileApi = {
  getProfile: () => apiClient.get('/api/profile'),
  createProfile: (data) => apiClient.post('/api/profile', data),
  updateProfile: (data) => apiClient.put('/api/profile', data),
};

// Venue API
export const venueApi = {
  getVenues: (type) => {
    const endpoint = type ? `/api/venues?type=${type}` : '/api/venues';
    return apiClient.get(endpoint);
  },
  getVenue: (id) => apiClient.get(`/api/venues/${id}`),
  initializeVenues: () => apiClient.post('/api/venues/initialize'),
  getUsersAtVenue: (venueId) => apiClient.get(`/api/venues/${venueId}/users`),
};

// Check-in API
export const checkInApi = {
  checkIn: (data) => apiClient.post('/api/checkin', data),
  checkOut: (data) => apiClient.post('/api/checkout', data),
  getCurrentCheckIn: () => apiClient.get('/api/checkin/current'),
};

// Match API
export const matchApi = {
  createMatch: (data) => apiClient.post('/api/matches', data),
  getMatches: () => apiClient.get('/api/matches'),
};
