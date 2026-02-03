import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { DataService } from "../services/data";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Global state for active notes (set by the active view)
    const [activeNotes, setActiveNotes] = useState([]);

    useEffect(() => {
        if (!user) {
            setCategories([]);
            setSubcategories([]);
            return;
        }

        const unsubCats = DataService.subscribeCategories(user.uid, (data) => {
            setCategories(data);
        });

        const unsubSubs = DataService.subscribeSubcategories(user.uid, (data) => {
            setSubcategories(data);
            setLoading(false);
        });

        return () => {
            unsubCats();
            unsubSubs();
        };
    }, [user]);

    // Helper to build tree
    const getSubcategories = (catId) => subcategories.filter(s => s.parentId === catId);

    return (
        <DataContext.Provider value={{
            categories,
            subcategories,
            getSubcategories,
            DataService,
            loading,
            activeNotes,
            setActiveNotes
        }}>
            {children}
        </DataContext.Provider>
    );
};
