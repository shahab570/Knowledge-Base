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

            <div className="toolbar-group">
                <div className="color-picker-wrapper">
                    <button className="toolbar-btn"><Type size={18} /></button>
                    <div className="color-dropdown">
                        {colors.map(c => (
                            <div
                                key={c.value}
                                className="color-option"
                                style={{ backgroundColor: c.value === 'inherit' ? '#fff' : c.value }}
                                onClick={() => editor.chain().focus().setColor(c.value === 'inherit' ? '' : c.value).run()}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                <div className="color-picker-wrapper">
                    <button className="toolbar-btn"><Highlighter size={18} /></button>
                    <div className="color-dropdown">
                        {highlights.map(h => (
                            <div
                                key={h.value}
                                className="color-option highlight-option"
                                style={{ backgroundColor: h.value === 'transparent' ? '#ccc' : h.value }}
                                onClick={() => editor.chain().focus().toggleHighlight({ color: h.value }).run()}
                                title={h.name}
                            />
                        ))}
                    </div>
                </div>
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

    const loadedNoteId = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (loadedNoteId.current === noteId) {
                setStatus('unsaved');
            }
        },
    });

    // Debounced Save
    useEffect(() => {
        if (status !== 'unsaved' || !editor) return;

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
    }, [status, title, editor, noteId]);

    // Fetch Note Data
    useEffect(() => {
        if (!noteId || !editor) return;

        setTitle('');
        setStatus('saved');
        loadedNoteId.current = null;
        editor.commands.setContent('');

        getDoc(doc(db, "notes", noteId)).then(snap => {
            if (snap.exists()) {
                const data = snap.data();
                setTitle(data.title || '');

                if (loadedNoteId.current !== noteId) {
                    editor.commands.setContent(data.content || '');
                    loadedNoteId.current = noteId;
                }
            }
        });
    }, [noteId, editor]);

    return (
        <div className="note-editor">
            <div className="editor-header">
                <input
                    value={title}
                    onChange={e => { setTitle(e.target.value); setStatus('unsaved'); }}
                    className="title-input"
                    placeholder="Untitled Note"
                />
                <div className="status-badge">
                    {status === 'saving' && 'Saving...'}
                    {status === 'saved' && 'Saved'}
                    {status === 'error' && 'Error saving'}
                    {status === 'unsaved' && 'Unsaved changes...'}
                </div>
            </div>
            <MenuBar editor={editor} title={title} />
            <div className="editor-canvas">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}
