import {Button, TextInput} from 'components';
import IDnd from 'icons/IDnd';
import {useState, useEffect, useRef} from 'react';
import {removeWhitespaces} from 'utils/text';
import {useTaskTrackerContext} from '../TackTrackerContext';
import classes from './styles.module.scss';
import cx from 'classnames';
import {getSmallUUID} from 'utils/uuid';
import {ProjectsListType, TaskType, ProjectType} from '../services/types';

type TaskProps = {
  projectId: keyof ProjectsListType;
  task: TaskType;
  nesting: number;
}
const Task = (props: TaskProps) => {
  const {projectId, task, nesting} = props;
  const [isSubtaskOpened, toggleSubtaskOpened] = useState(false);
  const [subtaskValue, setSubtaskValue] = useState('');
  const {handleTask} = useTaskTrackerContext();

  const {
    addSubtask,
    remove,
    toggleCompleted,
  } = handleTask(projectId, task.id);

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
          onChange={() => toggleCompleted(id, !isCompleted)}
          checked={isCompleted}
          title="Toggle completed"
        />
        <p className={cx(classes.description, {[classes.isCompleted]: isCompleted})}>{description}</p>

        <Button
          variant='text'
          onClick={() => toggleSubtaskOpened(true)}
          title="Add subtask"
        >
          +
        </Button>

        <Button
          variant='text'
          onClick={() => remove(id)}
        >
          Remove
        </Button>
      </div>

      {subTasks && (
        <TasksList nesting={nesting + 1} className={cx({[classes.subTaskList]: nesting < 30})} projectId={projectId} tasksList={subTasks} />
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
  nesting?: number;
}
export const TasksList = (props: TaskListProps) => {
  const {className, projectId, isFiltersApplied = false, tasksList, errorMsg, nesting = 0} = props;
  const {
    draggedId,
    draggedOverId,
    isDragged,
    handleDragOver,
    handleDragEnter,
    handleDragStart,
    handleDrop,
    handleSwapTasks,
  } = useTaskTrackerContext();
  const [draggable, toggleDraggable] = useState(false);

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
        style={(nesting > 0 && nesting < 30) ? {borderLeft: `1px solid hsl(${(nesting + 1) * 10}, 100%, 50%)`}: {}}
        onDragOver={handleDragOver}
        className={cx(classes.tasksListBox, className)}
      >
        {tasksList.map((item, index) => {
          return (
            <div
              id={item.id}
              draggable={draggable}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={handleDragEnter}
              onDrop={(e) => handleDrop(e, index, (draggedIndex, targetIndex) => handleSwapTasks(projectId, draggedIndex, targetIndex))}
              key={item.id}
              className={cx(classes.dragBox, {
                [classes.isDragStarted]: isDragged,
                [classes.dragged]: item.id === draggedId,
                [classes.draggedOver]: item.id === draggedOverId,
              })}
            >
              {(!isFiltersApplied && item.parentId === undefined) && (
                <Button
                  variant='text'
                  className={classes.dragIconButton}
                  onMouseDown={() => toggleDraggable(true)}
                  onMouseUp={() => toggleDraggable(false)}
                >
                  <IDnd />
                </Button>
              )}
              <div className={cx(classes.taskBox, {[classes.taskBoxMargin]: isFiltersApplied})}>
                <Task projectId={projectId} task={item} nesting={nesting + 1}/>
              </div>
            </div>
          );
        })}
      </div>}
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
