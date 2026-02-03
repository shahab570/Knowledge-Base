import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ id, data, children, className, handleStyles }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, data });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.3 : 1,
        position: 'relative',
        touchAction: 'none',
        willChange: 'transform', // performance optimization
        ...handleStyles
    };

    return (
        <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
            {children}
        </div>
    );
}
