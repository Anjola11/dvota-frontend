import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://dvota-backend-8e1684349b30.herokuapp.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 (Unauthorized) and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't attempt to refresh token for login requests
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            // If the error is specific to unverified email, we want to handle it in the component
            if (error.response?.data?.detail === "please verify your account before you can login") {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Call renew_access_token endpoint
                    const response = await axios.post(
                        `${api.defaults.baseURL}/auth/renew_access_token`,
                        { refresh_token: refreshToken }
                    );

                    if (response.data.success) {
                        const newAccessToken = response.data.data.access_token;

                        // Update storage
                        localStorage.setItem('access_token', newAccessToken);

                        // Update header for next requests
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed - clean up and redirect
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
