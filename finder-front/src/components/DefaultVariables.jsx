import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const DefaultVariables = ({ children }) => {
    const [isAuthenticated, setAuthorization] = useState(false);
    const [username, setUsername] = useState("Unauthorized");
    const [avatarUrl, setAvatarUrl] = useState("avatarUrl None");
    const [csrfToken, setCsrfToken] = useState("csrfToken None");

    return (
        <AuthContext.Provider value={{
            isAuthenticated, setAuthorization,
            username, setUsername,
            avatarUrl, setAvatarUrl,
            csrfToken, setCsrfToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);