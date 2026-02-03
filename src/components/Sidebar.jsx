import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { LogOut, Plus, ChevronRight, ChevronDown, Folder, Trash2, Settings, Book, LogIn, User, GripVertical, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

// DnD
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './dnd/SortableItem';

export default function Sidebar() {
    const { user, login, logout } = useAuth();
    const { categories, subcategories, DataService } = useData();
    const [expanded, setExpanded] = useState({});
    const navigate = useNavigate();

    // Auto-expand on hover during drag
    useDndMonitor({
        onDragOver(event) {
            const { over } = event;
            if (!over) return;

            // If dragging over a category, expand it
            if (over.data.current?.type === 'CATEGORY') {
                const catId = over.id;
                if (!expanded[catId]) {
                    setExpanded(prev => ({ ...prev, [catId]: true }));
                }
            }
        }
    });

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handleAddCategory = () => {
        if (!user) return;
        const title = prompt("New Category Name:");
        if (title) DataService.addCategory(user.uid, title, categories.length);
    };

    const handleRenameCat = (e, cat) => {
        e.stopPropagation();
        if (!user) return;
        const newTitle = prompt("Rename Category:", cat.title);
        if (newTitle && newTitle !== cat.title) {
            DataService.updateCategory(cat.id, { title: newTitle });
        }
    };

    const handleRenameSub = (e, sub) => {
        e.stopPropagation();
        if (!user) return;
        const newTitle = prompt("Rename Subcategory:", sub.title);
        if (newTitle && newTitle !== sub.title) {
            DataService.updateSubcategory(sub.id, { title: newTitle });
        }
    };

    const handleAddSub = (e, catId) => {
        e.stopPropagation();
        if (!user) return;
        const title = prompt("New Book/Subcategory Name:");
        const count = subcategories.filter(s => s.parentId === catId).length;
        if (title) {
            DataService.addSubcategory(user.uid, catId, title, count);
            setExpanded(prev => ({ ...prev, [catId]: true }));
        }
    };

    const handleDeleteCat = (e, id) => {
        e.stopPropagation();
        if (confirm("Delete category and all its contents?")) DataService.deleteCategory(id);
    };

    const handleDeleteSub = (e, id) => {
        e.stopPropagation();
        if (confirm("Delete subcategory?")) DataService.deleteSubcategory(id);
    };

    // Group subs by category
    const subsByCat = subcategories.reduce((acc, sub) => {
        if (!acc[sub.parentId]) acc[sub.parentId] = [];
        acc[sub.parentId].push(sub);
        return acc;
    }, {});

    const SidebarHeader = () => (
        <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo.png" alt="Knowledge Base Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <h2 className="brand">Knowledge Base</h2>
            </div>
            {user && (
                <button className="icon-btn primary" onClick={handleAddCategory} title="Add Category">
                    <Plus size={18} />
                </button>
            )}
        </div>
    );

    const GuestContent = () => (
        <div className="login-container">
            <p style={{ color: 'var(--text-dim)', marginBottom: '16px', fontSize: '0.9rem' }}>
                Sign in to sync your library across devices.
            </p>
            <button className="login-btn-large" onClick={login}>
                <LogIn size={20} />
                <span>Sign In with Google</span>
            </button>
        </div>
    );

    const [activeOverId, setActiveOverId] = useState(null);
    useDndMonitor({
        onDragOver({ over }) {
            setActiveOverId(over?.id || null);
        },
        onDragEnd() {
            setActiveOverId(null);
        }
    });

    const UserContent = () => (
        <div className="sidebar-content">
            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>No categories yet.</p>
                    <p style={{ fontSize: '0.8em', marginTop: '8px' }}>Click + to create one.</p>
                </div>
            ) : (
                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {categories.map(cat => {
                        return (
                            <SortableItem
                                key={cat.id}
                                id={cat.id}
                                data={{ type: 'CATEGORY', id: cat.id, title: cat.title }}
                                className="category-item"
                            >
                                {/* Category Row */}
                                <div
                                    className="tree-row category-row"
                                    onClick={() => toggleExpand(cat.id)}
                                    style={{
                                        backgroundColor: activeOverId === cat.id ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                                        transition: 'background-color 0.2s ease',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                >
                                    <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'grab', marginRight: '4px' }}>
                                        <GripVertical size={14} />
                                    </div>
                                    <span className="expand-icon">
                                        {expanded[cat.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </span>
                                    <span className="tree-label">{cat.title}</span>
                                    <div className="actions" onPointerDown={e => e.stopPropagation()}>
                                        <button className="icon-btn tiny" onClick={(e) => handleRenameCat(e, cat)} title="Rename"><Edit2 size={12} /></button>
                                        <button className="icon-btn tiny" onClick={(e) => handleAddSub(e, cat.id)} title="Add Subcategory"><Plus size={12} /></button>
                                        <button className="icon-btn tiny danger" onClick={(e) => handleDeleteCat(e, cat.id)}><Trash2 size={12} /></button>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {expanded[cat.id] && (
                                    <div className="sub-list expanded">
                                        <SortableContext
                                            items={(subsByCat[cat.id] || []).map(s => s.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {(subsByCat[cat.id] || []).map(sub => (
                                                <SortableItem
                                                    key={sub.id}
                                                    id={sub.id}
                                                    data={{ type: 'SUBCATEGORY', id: sub.id, parentId: cat.id, title: sub.title }}
                                                    className="tree-row sub-row"
                                                    handleStyles={{ cursor: 'grab' }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            backgroundColor: activeOverId === sub.id ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '4px'
                                                        }}
                                                        onClick={() => navigate(`/subcategory/${sub.id}`)}
                                                    >
                                                        <div className="drag-handle" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'grab', marginRight: '6px' }}>
                                                            <GripVertical size={12} />
                                                        </div>
                                                        <Book size={14} className="sub-icon" />
                                                        <span className="tree-label">{sub.title}</span>
                                                    </div>
                                                    <div className="actions" onPointerDown={e => e.stopPropagation()}>
                                                        <button className="icon-btn tiny" onClick={(e) => handleRenameSub(e, sub)} title="Rename"><Edit2 size={12} /></button>
                                                        <button className="icon-btn tiny danger" onClick={(e) => handleDeleteSub(e, sub.id)}><Trash2 size={12} /></button>
                                                    </div>
                                                </SortableItem>
                                            ))}
                                        </SortableContext>

                                        {(!subsByCat[cat.id] || subsByCat[cat.id].length === 0) && (
                                            <div className="tree-row empty-sub">Empty</div>
                                        )}
                                    </div>
                                )}
                            </SortableItem>
                        );
                    })}
                </SortableContext>
            )}
        </div>
    );

    const UserFooter = () => (
        <div className="sidebar-footer">
            <div className="user-profile">
                <div className="avatar">
                    <img src="/avatar.png" alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="user-info">
                    <div className="user-name">{user.displayName || user.email}</div>
                    <div className="user-status">Online</div>
                </div>
            </div>

            <div className="footer-actions">
                <button className="icon-btn" onClick={() => navigate('/settings')} title="Settings">
                    <Settings size={18} />
                </button>
                <button className="icon-btn" onClick={logout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );

    return (
        <aside className="sidebar">
            <SidebarHeader />
            {user ? <UserContent /> : <GuestContent />}
            {user && <UserFooter />}
        </aside>
    );

}
