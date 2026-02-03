import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Download, Type, Highlighter } from 'lucide-react';
import { exportNoteToDocx } from '../utils/exportUtils';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Editor.css';

const MenuBar = ({ editor, title }) => {
    if (!editor) return null;

    const [activeDropdown, setActiveDropdown] = useState(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.color-picker-wrapper')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name) => {
        setActiveDropdown(activeDropdown === name ? null : name);
    };

    const colors = [
        { name: 'Default', value: 'inherit' },
        { name: 'Indigo', value: '#6366f1' },
        { name: 'Purple', value: '#a855f7' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Green', value: '#22c55e' },
        { name: 'Blue', value: '#3b82f6' },
    ];

    const highlights = [
        { name: 'None', value: 'transparent' },
        { name: 'Yellow', value: '#fef08a' },
        { name: 'Green', value: '#bbf7d0' },
        { name: 'Blue', value: '#bfdbfe' },
        { name: 'Pink', value: '#fbcfe8' },
        { name: 'Purple', value: '#e9d5ff' },
        { name: 'Indigo', value: '#c7d2fe' },
    ];

    return (
        <div className="editor-toolbar">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}><Bold size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><Italic size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>U</span></button>

            <div className="divider" />

            {/* Flat structure for color pickers to avoid vertical stacking issues */}
            <div className="color-picker-wrapper" style={{ position: 'relative' }}>
                <button
                    className={`toolbar-btn ${activeDropdown === 'color' ? 'is-active' : ''}`}
                    title="Text Color"
                    onClick={() => toggleDropdown('color')}
                >
                    <Type size={18} />
                </button>
                {activeDropdown === 'color' && (
                    <div className="color-dropdown is-open">
                        {colors.map(c => (
                            <div
                                key={c.value}
                                className="color-option"
                                style={{ backgroundColor: c.value === 'inherit' ? '#fff' : c.value }}
                                onClick={() => {
                                    if (c.value === 'inherit') {
                                        editor.chain().focus().unsetColor().run();
                                    } else {
                                        editor.chain().focus().setColor(c.value).run();
                                    }
                                    setActiveDropdown(null);
                                }}
                                title={c.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="color-picker-wrapper" style={{ position: 'relative' }}>
                <button
                    className={`toolbar-btn ${activeDropdown === 'highlight' ? 'is-active' : ''}`}
                    title="Highlight"
                    onClick={() => toggleDropdown('highlight')}
                >
                    <Highlighter size={18} />
                </button>
                {activeDropdown === 'highlight' && (
                    <div className="color-dropdown is-open">
                        {highlights.map(h => (
                            <div
                                key={h.value}
                                className="color-option highlight-option"
                                style={{ backgroundColor: h.value === 'transparent' ? '#ccc' : h.value }}
                                onClick={() => {
                                    if (h.value === 'transparent') {
                                        editor.chain().focus().unsetHighlight().run();
                                    } else {
                                        editor.chain().focus().toggleHighlight({ color: h.value }).run();
                                    }
                                    setActiveDropdown(null);
                                }}
                                title={h.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="divider" />

            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}><Heading1 size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}><Heading2 size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}><Quote size={18} /></button>

            <div className="divider" />

            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}><List size={18} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}><ListOrdered size={18} /></button>

            <div style={{ marginLeft: 'auto' }}>
                <button onClick={() => exportNoteToDocx(title, editor.getHTML())} title="Export to Word">
                    <Download size={18} />
                </button>
            </div>
        </div>
    )
}

export default function NoteEditor() {
    const { noteId } = useParams();
    const { DataService } = useData();
    const [status, setStatus] = useState('saved');
    const [title, setTitle] = useState('');

    const [isLoaded, setIsLoaded] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            // Underline, // causing duplicate warning
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (isLoaded) {
                setStatus('unsaved');
            }
        },
    });

    // Debounced Save
    useEffect(() => {
        if (!isLoaded || status !== 'unsaved' || !editor) return;

        const timer = setTimeout(() => {
            setStatus('saving');
            const content = editor.getHTML();
            DataService.updateNote(noteId, { content, title })
                .then(() => setStatus('saved'))
                .catch(e => {
                    console.error("Save failed", e);
                    setStatus('error');
                });
        }, 1500);

        return () => clearTimeout(timer);
    }, [status, title, editor, noteId, isLoaded]);

    // Fetch Note Data
    useEffect(() => {
        if (!noteId || !editor) return;

        setIsLoaded(false); // Lock saving
        setTitle('');
        setStatus('saved');
        editor.commands.setContent('');
        editor.setEditable(false); // Prevent typing while loading

        getDoc(doc(db, "notes", noteId)).then(snap => {
            if (snap.exists()) {
                const data = snap.data();
                setTitle(data.title || '');
                editor.commands.setContent(data.content || '');
            }
            setIsLoaded(true); // Unlock saving
            editor.setEditable(true);
        }).catch(err => {
            console.error("Failed to load note:", err);
            setIsLoaded(true); // Unlock to allow creating new content if fetch failed (or maybe handle error better)
            editor.setEditable(true);
        });
    }, [noteId, editor]);

    return (
        <div className="note-editor">
            <div className="editor-header">
                <textarea
                    value={title}
                    onChange={e => {
                        setTitle(e.target.value);
                        setStatus('unsaved');
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onInput={e => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="title-input"
                    placeholder="Untitled Note"
                    rows={1}
                />
                <div className="status-badge">
                    {status === 'saving' && 'Saving...'}
                    {status === 'saved' && 'Saved'}
                    {status === 'error' && 'Error saving'}
                    {status === 'unsaved' && 'Unsaved changes...'}
                </div>
            </div>

            {/* Mobile Back Button - Only visible on small screens handled by CSS media queries usually, or we can add a class */}
            <div className="mobile-only-nav" style={{ padding: '0 20px', display: 'none' }}>
                <button onClick={() => window.history.back()} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    ← Back to list
                </button>
            </div>

            <MenuBar editor={editor} title={title} />
            <div className="editor-canvas">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
