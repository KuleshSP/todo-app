import useDragAndDrop from 'hooks/useDragAndDrop';
import useProject from './useProject';

export type ProjectId = string;
export type TasksList = TaskType[];
export type TaskType = {
  id: string;
  parentId?: string;
  description: string;
  isCompleted: boolean;
  subTasks?: TasksList;
}
export type ProjectType = {
  id: ProjectId;
  title: string;
  tasksList: TasksList;
  filters: {
    search: string;
  }
}

export type ProjectContextType = ReturnType<typeof useProject> & ReturnType<typeof useDragAndDrop>;
