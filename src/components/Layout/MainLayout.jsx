import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import '../../styles/Layout.css';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useData } from '../../contexts/DataContext';

const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export default function MainLayout() {
    const {
        categories,
        DataService,
        activeNotes,
        setActiveNotes
    } = useData();

    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require movement before drag starts code
            },
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        setActiveItem(event.active.data.current);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveItem(null);

        if (!over) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        // 1. Reorder Categories
        if (activeData?.type === 'CATEGORY' && overData?.type === 'CATEGORY') {
            if (active.id !== over.id) {
                const oldIndex = categories.findIndex(c => c.id === active.id);
                const newIndex = categories.findIndex(c => c.id === over.id);
                const newOrder = arrayMove(categories, oldIndex, newIndex);

                // Optimistic UI update comes from Context automatically when we write to Firestore?
                // No, we need to wait for listener. But arrayMove gives us the new order.
                // We send the updates to Firestore.
                const updates = newOrder.map((item, index) => ({
                    id: item.id,
                    order: index
                }));
                await DataService.reorderCategories(updates);
            }
        }

        // 2. Reorder Notes
        if (activeData?.type === 'NOTE' && overData?.type === 'NOTE') {
            if (active.id !== over.id) {
                const oldIndex = activeNotes.findIndex(n => n.id === active.id);
                const newIndex = activeNotes.findIndex(n => n.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newOrder = arrayMove(activeNotes, oldIndex, newIndex);
                    setActiveNotes(newOrder); // Optimistic

                    const updates = newOrder.map((item, index) => ({
                        id: item.id,
                        order: index
                    }));
                    await DataService.reorderNotes(updates);
                }
            }
        }

        // 3. Move Note to Subcategory (or Category logic if applicable)
        if (activeData?.type === 'NOTE' && (overData?.type === 'SUBCATEGORY' || overData?.type === 'CATEGORY')) {
            // Drop on Subcategory
            if (overData?.type === 'SUBCATEGORY') {
                const noteId = active.id;
                const newParentId = over.id;
                if (activeData.parentId !== newParentId) {
                    await DataService.moveNote(noteId, newParentId, 0);
                }
            }
            // Drop on Category -> Move to first subcategory? Or Category itself?
            // User requested "Move to Folder". If dropped on Category header, let's assume move to First Subcategory of that Category?
            // Or if we support Note-in-Category directly? Current data model seems to be Note -> Subcategory -> Category.
            // For now, ignore drop on Category for Notes to avoid confusion, or map to first sub.
        }

        // 4. Move Subcategory to Category (Reparenting)
        if (activeData?.type === 'SUBCATEGORY' && overData?.type === 'CATEGORY') {
            const subId = active.id;
            const newCatId = over.id;
            const currentCatId = activeData.parentId;

            if (currentCatId !== newCatId) {
                // Update parentId of the subcategory
                // We need a DataService method for this.
                await DataService.moveSubcategory(subId, newCatId);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="app-container">
                <Sidebar />
                <main className="content-area">
                    <Outlet />
                </main>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                    <div style={{
                        background: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        opacity: 0.9,
                        cursor: 'grabbing'
                    }}>
                        {activeItem?.title || "Item"}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
