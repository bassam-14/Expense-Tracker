import { createContext, useState, useContext } from 'react';

// 1. Create the Context (the invisible safe)
const AuthContext = createContext();

// 2. Create the Provider (the component that wraps your app)
export const AuthProvider = ({ children }) => {
    // Check if a token is already saved in the browser from a previous visit
    const [token, setToken] = useState(localStorage.getItem('jwtToken') || null);

    const login = (newToken) => {
        localStorage.setItem('jwtToken', newToken); // Save to browser storage
        setToken(newToken); // Save to React state
    };

    const logout = () => {
        localStorage.removeItem('jwtToken'); // Remove from browser
        setToken(null); // Clear React state
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Create a custom hook for easy access inside your other components
export const useAuth = () => useContext(AuthContext);