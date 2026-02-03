import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                const unsubscribe = onAuthStateChanged(auth, (u) => {
                    setUser(u);
                    setLoading(false);
                });
                return unsubscribe;
            })
            .catch((error) => {
                console.error("Auth initialization failed:", error);
                setLoading(false);
            });
    }, []);

    const login = () => signInWithPopup(auth, googleProvider);
    const logout = () => signOut(auth);

    const value = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : <div className="loading-screen">Loading...</div>}
        </AuthContext.Provider>
    );
};
