import {Button, TextInput} from 'components';
import {ProjectsListType} from 'features/TaskTracker/services/types';
import {useState, useEffect, useRef} from 'react';
import {removeWhitespaces} from 'utils/text';
import {getSmallUUID} from 'utils/uuid';
import {useProjectContext} from '../../services/ProjectContext';
import cx from 'classnames';
import classes from './styles.module.scss';
import ProjectTasksList from '../ProjectTasksList';
import {TaskType} from 'features/Project/services/types';

type TaskProps = {
  projectId: keyof ProjectsListType;
  task: TaskType;
  nestingPath: string[];
}
const ProjectTask = (props: TaskProps) => {
  const {projectId, task, nestingPath} = props;
  const [isSubtaskOpened, toggleSubtaskOpened] = useState(false);
  const [subtaskValue, setSubtaskValue] = useState('');
  const {handleTask} = useProjectContext();

  const {
    addSubtask,
    remove,
    toggleCompleted,
  } = handleTask([...nestingPath, task.id]);

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
          onClick={() => remove()}
        >
          Remove
        </Button>
      </div>

      {subTasks && (
        <ProjectTasksList
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

export default ProjectTask;
