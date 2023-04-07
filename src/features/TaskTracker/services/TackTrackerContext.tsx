import {createContext, useContext} from 'react';
import {TaskTrackerContextType} from './types';

const TaskTrackerContext = createContext<TaskTrackerContextType>(undefined as any);

export function useTaskTrackerContext() {
  const context = useContext<TaskTrackerContextType>(TaskTrackerContext);

  if (context === undefined) {
    throw new Error('useTaskTrackerContext must be within Provider');
  }

  return context;
}

export default TaskTrackerContext;
