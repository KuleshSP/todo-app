import {createContext, useContext} from 'react';
import {ProjectContextType} from './types';

const ProjectContext = createContext<ProjectContextType>(undefined as any);

export function useProjectContext() {
  const context = useContext<ProjectContextType>(ProjectContext);

  if (context === undefined) {
    throw new Error('useProjectContext must be within Provider');
  }

  return context;
}

export default ProjectContext;
