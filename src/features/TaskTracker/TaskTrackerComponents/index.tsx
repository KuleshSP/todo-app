import {Button, TextInput} from 'components';
import IDnd from 'icons/IDnd';
import React, {useState, useEffect, useRef} from 'react';
import {removeWhitespaces} from 'utils/text';
import {useTaskTrackerContext} from '../TackTrackerContext';
import classes from './styles.module.scss';
import cx from 'classnames';
import {getSmallUUID} from 'utils/uuid';
import {ProjectsListType, TaskType, ProjectType} from '../services/types';

type TaskProps = {
  projectId: keyof ProjectsListType;
  task: TaskType;
  nestingPath: string[];
}
const Task = (props: TaskProps) => {
  const {projectId, task, nestingPath} = props;
  const [isSubtaskOpened, toggleSubtaskOpened] = useState(false);
  const [subtaskValue, setSubtaskValue] = useState('');
  const {handleTask} = useTaskTrackerContext();

  const {
    addSubtask,
    remove,
    toggleCompleted,
  } = handleTask(projectId, [...nestingPath, task.id]);

  const {id, description, isCompleted, subTasks} = task;

  useEffect(() => {
    isSubtaskOpened && ref.current?.focus();
  }, [isSubtaskOpened]);

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className={classes.taskRow}>
        <input
          type="checkbox"
          className={classes.checkbox}
          onChange={() => toggleCompleted(!isCompleted)}
          checked={isCompleted}
          title="Toggle completed"
        />
        <p className={cx(classes.description, {[classes.isCompleted]: isCompleted})}>{description} ({id})</p>

        <Button
          variant='text'
          onClick={() => toggleSubtaskOpened(true)}
          title="Add subtask"
        >
          +
        </Button>

        <Button
          variant='text'
          onClick={() => remove()}
        >
          Remove
        </Button>
      </div>

      {subTasks && (
        <TasksList
          nestingPath={[...nestingPath, id]}
          className={cx({[classes.subTaskList]: nestingPath.length < 30})}
          projectId={projectId}
          tasksList={subTasks}
        />
      )}

      {isSubtaskOpened && (
        <form
          className={classes.subTaskListForm}
          onSubmit={(e) => {
            e.preventDefault();

            const withoutWhitespaces = removeWhitespaces(subtaskValue);
            if (withoutWhitespaces.length === 0) return;

            const smallId = getSmallUUID();

            const newSubTask = {id: smallId, parentId: id, description: withoutWhitespaces, isCompleted: false};

            addSubtask(newSubTask);

            setSubtaskValue('');
            toggleSubtaskOpened(false);
          }}
        >
          <TextInput ref={ref} value={subtaskValue} onChange={(e) => setSubtaskValue(e.target.value)} />
          <Button type='submit'>Add</Button>
          <Button
            variant='text'
            type='submit'
            onClick={() => {
              setSubtaskValue('');
              toggleSubtaskOpened(false);
            }}
          >
            Cancel
          </Button>
        </form>
      )}
    </>
  );
};

type TaskListProps = {
  projectId: keyof ProjectsListType;
  tasksList: TaskType[];
  isFiltersApplied?: boolean;
  className?: string;
  errorMsg?: string;
  nestingPath?: string[];
}
export const TasksList = (props: TaskListProps) => {
  const {className, projectId, isFiltersApplied = false, tasksList, errorMsg, nestingPath = []} = props;
  const {
    handleDragOver,
  } = useTaskTrackerContext();

  if (errorMsg) {
    return (
      <div className={classes.errorBox}>
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <>
      {tasksList.length !== 0 &&
      <div
        style={(nestingPath.length > 0 && nestingPath.length < 30) ? {borderLeft: `1px solid hsl(${(nestingPath.length + 1) * 10}, 100%, 50%)`}: {}}
        onDragOver={handleDragOver}
        className={cx(classes.tasksListBox, className)}
      >
        {tasksList.map((item, index) => {
          return (
            <DragWrapper
              key={item.id}
              id={item.id}
              index={index}
              projectId={projectId}
              wrapInDragContainer={nestingPath.length === 0}
            >
              <div className={cx(classes.taskBox, {[classes.taskBoxMargin]: isFiltersApplied})}>
                <Task projectId={projectId} task={item} nestingPath={nestingPath}/>
              </div>
            </DragWrapper>
          );
        })}
      </div>}
    </>
  );
};

type DragWrapperProps = {
  id: string;
  index: number;
  projectId: keyof ProjectsListType;
  wrapInDragContainer: boolean;
} & React.PropsWithChildren;

const DragWrapper = (props: DragWrapperProps) => {
  const {id, index, projectId, wrapInDragContainer, children} = props;
  const {
    draggedId,
    draggedOverId,
    isDragged,
    handleDragEnter,
    handleDragStart,
    handleDrop,
    handleDragEnd,
    handleSwapTasks,
  } = useTaskTrackerContext();
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
            onDrop={(e) => handleDrop(e, index, (draggedIndex, targetIndex) => handleSwapTasks(projectId, draggedIndex, targetIndex))}
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

type TasksSearchProps = {
  project?: ProjectType;
}

export const TasksSearch = (props: TasksSearchProps) => {
  const {project} = props;
  const {handleSearch} = useTaskTrackerContext();

  useEffect(() => {
    if (project === undefined) return;

    handleSearch(project?.id, project?.filters.search);
  }, []);

  if (project === undefined) {
    return null;
  }

  const {id, tasksList, filters: {search}} = project;


  return (
    <>
      {tasksList.length !== 0 &&
        <TextInput
          value={search}
          onChange={(e) => handleSearch(id, e.target.value)}
          placeholder='Search'
        />}
    </>
  );
};
