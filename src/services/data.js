import { db } from "../firebase";
import {
    collection, addDoc, updateDoc, deleteDoc, doc,
    query, where, onSnapshot, serverTimestamp, writeBatch
} from "firebase/firestore";

const CP = {
    CATS: "categories",
    SUBS: "subcategories",
    NOTES: "notes"
};

export const DataService = {
    // --- Categories ---
    subscribeCategories: (uid, callback) => {
        const q = query(
            collection(db, CP.CATS),
            where("uid", "==", uid)
        );
        return onSnapshot(q, (snap) => {
            let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (a.order || 0) - (b.order || 0));
            callback(items);
        }, (error) => {
            console.error("Error fetching categories:", error);
        });
    },

    addCategory: async (uid, title, order) => {
        return addDoc(collection(db, CP.CATS), {
            uid, title, order, createdAt: serverTimestamp()
        });
    },

    updateCategory: (id, data) => updateDoc(doc(db, CP.CATS, id), data),
    deleteCategory: (id) => deleteDoc(doc(db, CP.CATS, id)),

    reorderCategories: async (items) => {
        const batch = writeBatch(db);
        items.forEach((item) => {
            const ref = doc(db, CP.CATS, item.id);
            batch.update(ref, { order: item.order });
        });
        await batch.commit();
    },

    // --- Subcategories ---
    subscribeSubcategories: (uid, callback) => {
        const q = query(
            collection(db, CP.SUBS),
            where("uid", "==", uid)
        );
        return onSnapshot(q, (snap) => {
            let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            items.sort((a, b) => (a.order || 0) - (b.order || 0));
            callback(items);
        });
    },

    addSubcategory: (uid, parentId, title, order) => {
        return addDoc(collection(db, CP.SUBS), {
            uid, parentId, title, order, createdAt: serverTimestamp()
        });
    },

    updateSubcategory: (id, data) => updateDoc(doc(db, CP.SUBS, id), data),
    deleteSubcategory: (id) => deleteDoc(doc(db, CP.SUBS, id)),

    reorderSubcategories: async (items) => {
        const batch = writeBatch(db);
        items.forEach((item) => {
            const ref = doc(db, CP.SUBS, item.id);
            batch.update(ref, { order: item.order });
        });
        await batch.commit();
    },

    // --- Notes ---
    subscribeNotes: (uid, parentId, callback) => {
        const q = query(
            collection(db, CP.NOTES),
            where("uid", "==", uid),
            where("parentId", "==", parentId)
        );
        return onSnapshot(q, (snap) => {
            let items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Sort by order first, then updated
            items.sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                const tA = a.updatedAt?.seconds || 0;
                const tB = b.updatedAt?.seconds || 0;
                return tB - tA;
            });
            callback(items);
        });
    },

    addNote: (uid, parentId, title, order = 0) => {
        return addDoc(collection(db, CP.NOTES), {
            uid, parentId, title,
            content: "",
            order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    updateNote: (id, data) => {
        return updateDoc(doc(db, CP.NOTES, id), {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    moveNote: async (noteId, newParentId, newOrder) => {
        return updateDoc(doc(db, CP.NOTES, noteId), {
            parentId: newParentId,
            order: newOrder,
            updatedAt: serverTimestamp()
        });
    },

    moveSubcategory: async (subId, newParentId) => {
        return updateDoc(doc(db, CP.SUBS, subId), {
            parentId: newParentId,
            updatedAt: serverTimestamp()
        });
    },

    reorderNotes: async (items) => {
        const batch = writeBatch(db);
        items.forEach((item) => {
            const ref = doc(db, CP.NOTES, item.id);
            batch.update(ref, { order: item.order });
        });
        await batch.commit();
    },

    deleteNote: (id) => deleteDoc(doc(db, CP.NOTES, id)),
    getNote: (id) => doc(db, CP.NOTES, id)
};
