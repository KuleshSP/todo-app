import useProject from './useProject';
import ProjectContext from './ProjectContext';
import {ProjectType} from './types';
import useDragAndDrop from 'hooks/useDragAndDrop';

type ProjectProviderProps = {
  project?: ProjectType;
  handleUpdateProjects: (project: ProjectType) => void;
} & React.PropsWithChildren;

const ProjectProvider = (props: ProjectProviderProps) => {
  const {children, project, handleUpdateProjects} = props;
  const projectCopy = project ? JSON.parse(JSON.stringify(project)) : undefined;

  const state = useProject(projectCopy, handleUpdateProjects);
  const dnd = useDragAndDrop();

  return (
    <ProjectContext.Provider value={{...state, ...dnd}}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;
