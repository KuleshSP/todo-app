import {useEffect, useState} from 'react';
import {ProjectsListType} from './types';
import {ProjectType} from 'features/Project/services/types';

const useTaskTracker = (initialProjects: ProjectsListType | undefined) => {
  const [projects, setProjects] = useState<ProjectsListType | undefined>(initialProjects);

  const handleUpdateProjects = (project: ProjectType) => {
    setProjects((prev) => ({...prev, [project.id]: project}));
  };

  const handleCreateNewProject = ({id, title}: Pick<ProjectType, 'id' | 'title'>) => {
    setProjects((prev) => ({...prev, [id]: {id, title, tasksList: [], filters: {search: ''}}}));
  };

  const handleRemoveProject = (id: string) => {
    setProjects((prev) => {
      if (prev === undefined) return prev;

      const filtered = Object.entries(prev).reduce((acc, [key, value]) => {
        if (key === id) return acc;

        return {
          ...acc,
          [key]: value,
        };
      }, {});

      return filtered;
    });
  };

  useEffect(() => {
    if (JSON.stringify(initialProjects) === JSON.stringify(projects)) return;

    setProjects(initialProjects);
  }, [JSON.stringify(initialProjects)]);

  useEffect(() => {
    if (!projects) return;

    if (JSON.stringify(projects) === localStorage.getItem('projects')) return;

    localStorage.setItem('projects', JSON.stringify(projects));
  }, [JSON.stringify(projects)]);

  useEffect(() => {
    function synchronizePagesState() {
      const _localStorage = JSON.parse(localStorage.getItem('projects') || 'null');

      if (_localStorage) {
        setProjects(_localStorage);
      }
    }

    window.addEventListener('storage', synchronizePagesState);

    return () => {
      window.removeEventListener('storage', synchronizePagesState);
    };
  }, []);

  return {
    projects,
    handleCreateNewProject,
    handleRemoveProject,
    handleUpdateProjects,
  };
};

export default useTaskTracker;
