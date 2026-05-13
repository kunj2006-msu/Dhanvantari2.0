// src/services/authService.ts

const BASE_URL = 'http://localhost:8080/api/auth';

export const authService = {
    // 1. Log in an existing user
    async login(credentials: any) {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            // If backend throws a 401 Unauthorized or 403 Forbidden
            const errorText = await response.text();
            let errorMessage = 'Authentication failed';
            try {
                const errorObj = JSON.parse(errorText);
                errorMessage = errorObj.message || errorObj.error || errorMessage;
            } catch (e) {
                errorMessage = errorText;
            }
            throw new Error(`${response.status}: ${errorMessage}`);
        }

        const data = await response.json();

        // Save the security token to the browser
        if (data.token) {
            localStorage.setItem('dhanvantari_token', data.token);
        }

        return data;
    },

    // 2. Register a new user (Patient or Doctor)
    async register(userData: any) {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            // If backend says email already exists, etc.
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed. Please try again.');
        }

        return await response.json();
    },

    // 3. Log out (Destroy the token)
    logout() {
        localStorage.removeItem('dhanvantari_token');
    },

    // 4. Get the token for future API calls (like sending AI chats)
    getToken() {
        return localStorage.getItem('dhanvantari_token');
    },

    // 5. Fetch the full user profile
    async getProfile() {
        const token = this.getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch('http://localhost:8080/api/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return await response.json();
    }
};