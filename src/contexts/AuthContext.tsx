import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse } from '@/types';
import api from '@/lib/axios';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginResponse) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user data on mount
        // Cookies handle actual authentication, we just need user info for UI
        const storedUser = localStorage.getItem('user');

        if (storedUser && storedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) {
                    setUser(parsedUser);
                } else {
                    throw new Error("Parsed user is null/invalid");
                }
            } catch (e) {
                console.error("Failed to parse user", e);
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (data: any) => {
        // Handle flat structure from API: access_token, refresh_token, user_id, fullName, email, ...
        const userObj: User = {
            id: data.user_id || data.id || '',
            email: data.email || '',
            fullName: data.fullName || '',
            role: data.role || 'voter',
            profile_picture_url: data.profile_picture_url || ''
        };

        if (!userObj.id) {
            console.error("Login data missing user_id:", data);
        }

        // Development mode: Store tokens in localStorage (cross-origin cookies don't work)
        // Production mode: Tokens are in httponly cookies only
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment && data.access_token && data.refresh_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
    };

    const logout = async () => {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        try {
            if (isDevelopment) {
                // Development: Send refresh token in body
                const refreshToken = localStorage.getItem('refresh_token');
                await api.post('/auth/logout', { refresh_token: refreshToken });
            } else {
                // Production: Cookies are automatically sent
                await api.post('/auth/logout', {});
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all local storage
            if (isDevelopment) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
