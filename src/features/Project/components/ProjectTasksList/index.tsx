import {ProjectsListType} from 'features/TaskTracker/services/types';
import {useProjectContext} from '../../services/ProjectContext';
import ProjectTask from '../ProjectTask';
import cx from 'classnames';
import classes from './styles.module.scss';
import ProjectDragBox from '../ProjectDragBox';
import {TasksList} from 'features/Project/services/types';

type ProjectTaskListProps = {
  projectId: keyof ProjectsListType;
  tasksList: TasksList;
  isFiltersApplied?: boolean;
  className?: string;
  errorMsg?: string;
  nestingPath?: string[];
}
const ProjectTasksList = (props: ProjectTaskListProps) => {
  const {className, projectId, isFiltersApplied = false, tasksList, errorMsg, nestingPath = []} = props;
  const {
    handleDragOver,
  } = useProjectContext();

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
            <ProjectDragBox
              key={item.id}
              id={item.id}
              index={index}
              wrapInDragContainer={nestingPath.length === 0}
            >
              <div className={cx(classes.taskBox, {[classes.taskBoxMargin]: isFiltersApplied})}>
                <ProjectTask projectId={projectId} task={item} nestingPath={nestingPath}/>
              </div>
            </ProjectDragBox>
          );
        })}
      </div>}
    </>
  );
};

export default ProjectTasksList;
