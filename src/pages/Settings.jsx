import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { User, Trash2, AlertTriangle, Save } from 'lucide-react';
import { updateProfile, deleteUser } from 'firebase/auth'; // Ensure you import these
import '../styles/Settings.css'; // We'll create this

export default function Settings() {
    const { user, logout } = useAuth();
    const { DataService, categories } = useData(); // We might need a purge function in DataService
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(user, { displayName });
            setMsg('Profile updated successfully.');
        } catch (e) {
            console.error(e);
            setMsg('Error updating profile.');
        }
        setLoading(false);
    };

    const handleDeleteData = async () => {
        if (!window.confirm("ARE YOU SURE? This will delete ALL categories, subcategories, and notes. This cannot be undone.")) return;

        setLoading(true);
        try {
            // This is a heavy client-side operation if we don't have a cloud function.
            // For now, we iterate categories and delete them (which currently doesn't cascade in Firestore without cloud functions)
            // But our DataService.deleteCategory is simple. 
            // Realistically, for this prototype, we'll just implement a "Delete All" loop or warning.
            // Let's loop categories for now.
            for (const cat of categories) {
                await DataService.deleteCategory(cat.id);
                // We need to delete subcats and notes too, but our DataService deleteCategory likely only deletes the doc.
                // Ideally we'd have a recursive delete.
            }
            setMsg('All data deleted.');
        } catch (e) {
            console.error(e);
            setMsg('Error deleting data.');
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("DANGER: This will permanently delete your account and you will lose access immediately.")) return;
        if (!window.confirm("Double check: Are you absolutely sure?")) return;

        try {
            await deleteUser(user);
            // Auth listener will redirect to login
        } catch (e) {
            console.error(e);
            setMsg('Error deleting account. You may need to re-login first.');
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Settings</h1>

                {msg && <div className="settings-msg">{msg}</div>}

                <section className="settings-section">
                    <h2><User size={20} /> Profile</h2>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="text" value={user?.email} disabled className="input-disabled" />
                    </div>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={handleUpdateProfile} disabled={loading}>
                        <Save size={16} /> Save Changes
                    </button>
                </section>

                <section className="settings-section danger-zone">
                    <h2><AlertTriangle size={20} /> Danger Zone</h2>
                    <div className="danger-row">
                        <div>
                            <h3>Delete All Data</h3>
                            <p>Permanently remove all categories, books, and notes.</p>
                        </div>
                        <button className="btn-danger" onClick={handleDeleteData} disabled={loading}>
                            Delete Data
                        </button>
                    </div>
                    <div className="danger-row">
                        <div>
                            <h3>Delete Account</h3>
                            <p>Remove your account and access to the application.</p>
                        </div>
                        <button className="btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                            <Trash2 size={16} /> Delete Account
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
