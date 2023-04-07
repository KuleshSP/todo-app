import {TextInput} from 'components';
import {useEffect} from 'react';
import {useProjectContext} from '../../services/ProjectContext';

const ProjectTasksSearch = () => {
  const {project, handleSearch} = useProjectContext();

  useEffect(() => {
    if (project === undefined) return;

    handleSearch(project?.filters.search);
  }, []);

  if (project === undefined) {
    return null;
  }

  const {tasksList, filters: {search}} = project;


  return (
    <>
      {tasksList.length !== 0 &&
        <TextInput
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder='Search'
        />}
    </>
  );
};

export default ProjectTasksSearch;
