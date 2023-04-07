import {useState, DragEvent} from 'react';

const useDragAndDrop = () => {
  const [isDragged, toggleDragged] = useState(false);
  const [draggedId, setDraggedId] = useState<string | undefined>(undefined);
  const [draggedOverId, setDraggedOverId] = useState<string | undefined>(undefined);

  const handleDragStart = (e: DragEvent, index: number) => {
    toggleDragged(true);

    e.dataTransfer.setData('index', String(index));
    setDraggedId((e.target as HTMLDivElement).id);
  };

  const handleDragEnter = (e: DragEvent) => {
    setDraggedOverId((e.target as HTMLDivElement).id);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent, dragOverIndex: number, cb: (draggedIndex: number, targetIndex: number) => void) => {
    e.preventDefault();

    setDraggedOverId(undefined);
    setDraggedId(undefined);
    toggleDragged(false);

    const draggedId = parseInt(e.dataTransfer.getData('index'), 10);

    if (draggedId === dragOverIndex) return;

    cb(draggedId, dragOverIndex);
  };

  const handleDragEnd = () => {
    setDraggedOverId(undefined);
    setDraggedId(undefined);
    toggleDragged(false);
  };

  return {
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    isDragged,
    draggedId,
    draggedOverId,
  };
};

export default useDragAndDrop;
