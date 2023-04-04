import useDragAndDrop from './useDragAndDrop';
import useTaskTracker from './useTaskTracker';

export type ProjectId = string;
export type TaskType = {
  id: string;
  parentId?: string;
  description: string;
  isCompleted: boolean;
  subTasks?: TaskType[];
}
export type ProjectType = {
  id: ProjectId;
  title: string;
  tasksList: TaskType[];
  filters: {
    search: string;
  }
}
export type ProjectsListType = Record<ProjectId, ProjectType>;

export type TaskTrackerContextType ={
  projects: ProjectsListType | undefined;
} & ReturnType<typeof useTaskTracker> & ReturnType<typeof useDragAndDrop>;
