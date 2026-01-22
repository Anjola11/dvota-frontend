import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dvota-backend-8e1684349b30.herokuapp.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
    withCredentials: true, // Enable cookies for same-origin production deployments
});

// For local development (localhost → Heroku), use Bearer tokens
// For production (same domain), cookies work automatically
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

api.interceptors.request.use((config) => {
    if (isDevelopment) {
        // Development: Use Bearer tokens (cross-origin cookies don't work)
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    // Production: Cookies are automatically sent via withCredentials
    return config;
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't attempt to refresh token for login/auth requests
            if (originalRequest.url?.includes('/auth/login') || 
                originalRequest.url?.includes('/auth/signup') ||
                originalRequest.url?.includes('/auth/verify_otp') ||
                originalRequest.url?.includes('/auth/renew_access_token')) {
                return Promise.reject(error);
            }

            // If the error is specific to unverified email, handle in component
            if (error.response?.data?.detail === "Please verify your account before you can login") {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isDevelopment) {
                // Development mode: Use Bearer token refresh
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                try {
                    const response = await axios.post(
                        `${api.defaults.baseURL}/auth/renew_access_token`,
                        {},
                        {
                            headers: { Authorization: `Bearer ${refreshToken}` },
                            withCredentials: true
                        }
                    );

                    if (response.data.success && response.data.data.access_token) {
                        const newAccessToken = response.data.data.access_token;
                        const newRefreshToken = response.data.data.refresh_token;

                        localStorage.setItem('access_token', newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // Production mode: Use cookie-based refresh
                try {
                    const response = await axios.post(
                        `${api.defaults.baseURL}/auth/renew_access_token`,
                        {},
                        { withCredentials: true }
                    );

                    if (response.data.success) {
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
