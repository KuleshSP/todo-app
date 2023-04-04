import {useEffect, useState} from 'react';
import {tryParseJSONObject} from 'utils/json';
import {removeWhitespaces} from 'utils/text';
import {ProjectsListType, TaskType, ProjectType} from './types';

const useTaskTracker = (initialProjects: ProjectsListType | undefined) => {
  const [projects, setProjects] = useState<ProjectsListType | undefined>(initialProjects);
  const [filteredProjects, setFilteredProjects] = useState<TaskType[]>([]);
  const [importError, setImportError] = useState<string | undefined>(undefined);

  const handleCreateNewProject = ({id, title}: Pick<ProjectType, 'id' | 'title'>) => {
    setProjects((prev) => ({...prev, [id]: {id, title, tasksList: [], filters: {search: ''}}}));
  };

  const handleRemoveProject = (id: string) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));
    const filtered = Object.entries(copy).reduce((acc, [key, value]) => {
      if (key === id) return acc;

      return {
        ...acc,
        [key]: value,
      };
    }, {});
    setProjects(filtered);
  };

  const handleChangeProjectTitle = ({id, title}: Pick<ProjectType, 'id' | 'title'>) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));

    copy[id].title = title;

    setProjects(copy);
  };

  const handleAddNewTask = (projectId: keyof ProjectsListType, description: string, id: string) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));

    copy[projectId].tasksList.push({id, description, isCompleted: false});

    setProjects(copy);
  };

  const handleTask = (projectId: keyof ProjectsListType, targetId: string) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));
    const currentProjectTasks = copy[projectId].tasksList;
    const filteredCopy: TaskType[] = JSON.parse(JSON.stringify(filteredProjects));

    function findTarget(projectTasks: TaskType[], targetId: string | undefined, cb: (item: TaskType) => TaskType | undefined): TaskType[] {
      return projectTasks.reduce((acc, curr) => {
        if (targetId === undefined) {
          const result = cb(curr);

          if (result === undefined) return acc;

          return [
            ...acc,
            {
              ...result,
              ...(curr.subTasks && {subTasks: findTarget(curr.subTasks, undefined, cb)}),
            },
          ];
        }

        if (targetId === curr.id) {
          const result = cb(curr);

          if (result) {
            return [...acc, result];
          } else {
            return acc;
          }
        } else {
          return [
            ...acc,
            {
              ...curr,
              ...(curr.subTasks && {subTasks: findTarget(curr.subTasks, targetId, cb)}),
            },
          ];
        }
      }, [] as TaskType[]);
    }

    return {
      addSubtask: (newSubTask: TaskType) => {
        const result = findTarget(
            currentProjectTasks,
            targetId,
            (item) => ({
              ...item,
              subTasks: item.subTasks ? [...item.subTasks, newSubTask] : [newSubTask],
            })
        );
        copy[projectId].tasksList = result;

        setProjects(copy);
      },
      remove: (id: TaskType['id']) => {
        const result = findTarget(
            currentProjectTasks,
            targetId,
            (item) => item.id === id ? undefined : item,
        );
        copy[projectId].tasksList = result;

        setProjects(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.filter((item) => item.id !== id);

        setFilteredProjects(filteredResult);
      },
      toggleCompleted: (id: TaskType['id'], isCompleted: TaskType['isCompleted']) => {
        const result = findTarget(
            currentProjectTasks,
            targetId,
            (item) =>{
              if (item.id === id) {
                if (item.subTasks) {
                  const allChildren = item.subTasks && findTarget(item.subTasks, undefined, (item) => ({...item, isCompleted}));

                  return {
                    ...item,
                    isCompleted,
                    subTasks: allChildren,
                  };
                } else {
                  return {
                    ...item,
                    isCompleted,
                  };
                }
              } else {
                return item;
              }
            }
        );

        copy[projectId].tasksList = result;

        setProjects(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.map((item) => item.id === id ? {...item, isCompleted} : item);

        setFilteredProjects(filteredResult);
      },
    };
  };

  const handleSearch = (projectId: keyof ProjectsListType, value: string) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));
    const project = copy[projectId];

    project.filters.search = value;

    setProjects(copy);

    function getFlatList(tasks: TaskType[] | undefined): TaskType[] {
      if (tasks === undefined) return [];

      return tasks.reduce((acc, item) => [...acc, item, ...getFlatList(item.subTasks)], [] as TaskType[]);
    }

    const searchResult = getFlatList(project?.tasksList)
        .map(({subTasks, ...rest}) => rest)
        .filter((item) => {
          const clearValue = removeWhitespaces(value).toLowerCase();
          if (clearValue === '') return false;

          return item.description.toLowerCase().includes(removeWhitespaces(value).toLowerCase());
        });

    setFilteredProjects(searchResult);
  };

  const handleSwapTasks = (projectId: keyof ProjectsListType, indexX: number, indexY: number) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));
    const currentProjectTasks = copy[projectId].tasksList;

    const removed = currentProjectTasks.splice(indexX, 1);

    currentProjectTasks.splice(indexY, 0, removed[0]);

    setProjects(copy);
  };

  const handleImport = (value: string, projectId: keyof ProjectsListType, onSuccess: () => void) => {
    function checkTasksList(tasksList: TaskType[]): TaskType[] {
      return tasksList.reduce((acc, task) => {
        const {id, parentId, description, isCompleted, subTasks} = task;

        if (
          typeof id !== 'string' ||
          (parentId !== undefined && typeof parentId !== 'string') ||
          typeof description !== 'string' ||
          typeof isCompleted !== 'boolean' ||
          (subTasks !== undefined && Array.isArray(subTasks) === false)
        ) {
          throw new Error('Invalid data format');
        }

        return [
          ...acc,
          {
            id,
            parentId,
            description,
            isCompleted,
            subTasks: subTasks ? checkTasksList(subTasks) : undefined,
          },
        ];
      }, [] as TaskType[]);
    }

    function collectIds(tasksList: TaskType[]): string[] {
      return tasksList.reduce((acc, task) => {
        const ret = task.subTasks ? collectIds(task.subTasks) : [];

        return [...acc, task.id, ...ret];
      }, [] as string[]);
    }

    try {
      const parsedJSON: TaskType[] = tryParseJSONObject(value);

      if (Array.isArray(parsedJSON) === false) {
        throw new Error('Tasks must be an array');
      }

      const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));

      const tasksListClean = checkTasksList(parsedJSON);
      const flatIdList = collectIds(parsedJSON);
      const withoutDuplicates = [...new Set(flatIdList)];

      if (flatIdList.length !== withoutDuplicates.length) {
        throw new Error('Duplicate id found');
      }

      copy[projectId].tasksList = tasksListClean;

      setProjects(copy);
      onSuccess();
    } catch (e: unknown) {
      console.error(e);

      const message = e instanceof Error ? e.message : String(e);

      setImportError(message);
    }
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
    function checkUserData() {
      const item = JSON.parse(localStorage.getItem('projects') || 'null');

      if (item) {
        setProjects(item);
      }
    }

    window.addEventListener('storage', checkUserData);

    return () => {
      window.removeEventListener('storage', checkUserData);
    };
  }, []);

  return {
    projects,
    handleCreateNewProject,
    handleRemoveProject,
    handleChangeProjectTitle,
    handleAddNewTask,
    handleTask,
    filteredProjects,
    setFilteredProjects,
    handleSearch,
    handleSwapTasks,
    handleImport,
    importError,
    setImportError,
  };
};

export default useTaskTracker;
