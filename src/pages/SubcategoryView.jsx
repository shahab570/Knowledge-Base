import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet, useMatch } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { FileText, Search, Trash2 } from 'lucide-react';
import '../styles/NoteList.css';

// DnD
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '../components/dnd/SortableItem';

export default function SubcategoryView() {
    const { subId } = useParams();
    const { user } = useAuth();
    const { DataService, activeNotes, setActiveNotes } = useData();
    const navigate = useNavigate();
    // We keep a local loading state if needed, but activeNotes is our source of truth for UI
    const match = useMatch("/subcategory/:subId/note/:noteId");
    const isNoteSelected = !!match;

    useEffect(() => {
        if (!user || !subId) return;

        // Subscribe to notes
        const unsub = DataService.subscribeNotes(user.uid, subId, (data) => {
            setActiveNotes(data);
        });

        return () => {
            unsub();
            setActiveNotes([]); // Clear on unmount
        };
    }, [user, subId, DataService, setActiveNotes]);

    const handleAddNote = async () => {
        // Optimistic? DataService returns ref, so probably wait.
        // Or we could optimistically add to activeNotes?
        // DataService.addNote is async. User expects instant.
        // For now, let's just wait for subscription update.
        const ref = await DataService.addNote(user.uid, subId, "Untitled Note", activeNotes.length);
        navigate(`note/${ref.id}`);
    };

    return (
        <div className="subcategory-view">
            <div className={`note-list-col ${isNoteSelected ? 'hidden-mobile' : ''}`}>
                <div className="list-header">
                    <div className="search-bar">
                        <Search size={14} />
                        <input type="text" placeholder="Search notes..." />
                    </div>
                    <button className="btn-primary" onClick={handleAddNote} style={{ flexShrink: 0, padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        + New
                    </button>
                </div>

                <div className="list-content">
                    {activeNotes.length === 0 && <div className="empty-list">No notes here.</div>}

                    <SortableContext items={activeNotes.map(n => n.id)} strategy={verticalListSortingStrategy}>
                        {activeNotes.map(note => (
                            <SortableItem
                                key={note.id}
                                id={note.id}
                                data={{ type: 'NOTE', id: note.id, parentId: subId, title: note.title }}
                                className={`note-item ${match?.params?.noteId === note.id ? 'active' : ''}`}
                            >
                                {/* We wrap the content in a div that handles the click for navigation but passes dragging to the SortableItem wrapper */}
                                <div
                                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '16px' }}
                                    onClick={() => navigate(`note/${note.id}`)}
                                >
                                    <div className="note-icon"><FileText size={16} /></div>
                                    <div className="note-info">
                                        <div className="note-title">{note.title || "Untitled"}</div>
                                        <div className="note-date">
                                            {note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-note-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this note?")) {
                                                DataService.deleteNote(note.id);
                                            }
                                        }}
                                        title="Delete Note"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </div>
            </div>

            <div className={`editor-col ${!isNoteSelected ? 'hidden-mobile-editor' : ''}`}>
                <Outlet />
                {!isNoteSelected && (
                    <div className="empty-editor-state">
                        <FileText size={48} opacity={0.1} />
                        <p>Select a note to view or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
