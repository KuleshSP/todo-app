import {Button} from 'components';
import IDnd from 'icons/IDnd';
import {useState} from 'react';
import {useProjectContext} from '../../services/ProjectContext';
import cx from 'classnames';
import classes from './styles.module.scss';

type DragWrapperProps = {
  id: string;
  index: number;
  wrapInDragContainer: boolean;
} & React.PropsWithChildren;

const ProjectDragBox = (props: DragWrapperProps) => {
  const {id, index, wrapInDragContainer, children} = props;
  const {
    handleSwapTasks,
    draggedId,
    draggedOverId,
    isDragged,
    handleDragEnter,
    handleDragStart,
    handleDrop,
    handleDragEnd,
  } = useProjectContext();

  const [draggable, toggleDraggable] = useState(false);

  return (
    <>
      {wrapInDragContainer ?
        (
          <div
            id={id}
            draggable={draggable}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={handleDragEnter}
            onDrop={(e) => handleDrop(e, index, (draggedIndex, targetIndex) => handleSwapTasks(draggedIndex, targetIndex))}
            onDragEnd={() => {
              toggleDraggable(false);
              handleDragEnd();
            }}
            className={cx(classes.dragBox, {
              [classes.isDragStarted]: isDragged,
              [classes.dragged]: id === draggedId,
              [classes.draggedOver]: id === draggedOverId,
            })}
          >
            <Button
              variant='text'
              className={classes.dragIconButton}
              onMouseDown={() => toggleDraggable(true)}
              onMouseUp={() => toggleDraggable(false)}
            >
              <IDnd />
            </Button>
            {children}
          </div>
        ) :
        (
          <>{children}</>
        )
      }
    </>
  );
};

export default ProjectDragBox;
