import TaskTrackerContext from './TackTrackerContext';
import useDragAndDrop from './services/useDragAndDrop';
import useTaskTracker from './services/useTaskTracker';
import {ProjectsListType} from './services/types';

type TaskTrackerProviderProps = {
  projects: ProjectsListType | undefined;
} & React.PropsWithChildren;

const TaskTrackerProvider = (props: TaskTrackerProviderProps) => {
  const {children, projects: initialProjects} = props;

  const state = useTaskTracker(initialProjects);
  const dnd = useDragAndDrop();

  return (
    <TaskTrackerContext.Provider value={{...state, ...dnd}}>
      {children}
    </TaskTrackerContext.Provider>
  );
};

export default TaskTrackerProvider;
