import TaskTrackerContext from './TackTrackerContext';
import useTaskTracker from './useTaskTracker';
import {ProjectsListType} from './types';

type TaskTrackerProviderProps = {
  projects: ProjectsListType | undefined;
} & React.PropsWithChildren;

const TaskTrackerProvider = (props: TaskTrackerProviderProps) => {
  const {children, projects: initialProjects} = props;

  const state = useTaskTracker(initialProjects);

  return (
    <TaskTrackerContext.Provider value={state}>
      {children}
    </TaskTrackerContext.Provider>
  );
};

export default TaskTrackerProvider;
