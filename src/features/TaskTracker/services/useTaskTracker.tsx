import {useEffect, useState} from 'react';
import {tryParseJSONObject} from 'utils/json';
import {removeWhitespaces} from 'utils/text';
import {ProjectsListType, TaskType, ProjectType} from './types';

const useTaskTracker = (initialProjects: ProjectsListType | undefined) => {
  const [projects, setProjects] = useState<ProjectsListType | undefined>(initialProjects);
  const [filteredTasks, setFilteredTasks] = useState<TaskType[]>([]);
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

  const handleTask = (projectId: keyof ProjectsListType, path: string[]) => {
    const copy: ProjectsListType = JSON.parse(JSON.stringify(projects));
    const {tasksList} = copy[projectId];
    const filteredCopy: TaskType[] = JSON.parse(JSON.stringify(filteredTasks));
    const targetId = path[path.length - 1];

    function traverse(projectTasks: TaskType[], path: string[], callback: (item: TaskType) => TaskType | undefined): TaskType[] {
      return projectTasks.reduce((acc, item) => {
        const [pathHead, ...pathTail] = path;
        if (pathHead === item.id) {
          const callbackResult = callback(item);

          if (callbackResult !== undefined) {
            callbackResult.subTasks && (callbackResult.subTasks = traverse(callbackResult.subTasks, pathTail, callback));

            acc.push(callbackResult);
          }
          return acc;
        }

        acc.push(item);
        return acc;
      }, [] as TaskType[]);
    }


    return {
      addSubtask: (newSubTask: TaskType) => {
        traverse(
            tasksList,
            path,
            (item) => {
              if (item.id === targetId) {
                item.subTasks = item.subTasks ? [...item.subTasks, newSubTask] : [newSubTask];
              }

              return item;
            }
        );

        setProjects(copy);
      },
      remove: () => {
        traverse(
            tasksList,
            path,
            (item) => item.id === targetId ? undefined : item,
        );

        setProjects(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.filter((item) => item.id !== targetId);
        setFilteredTasks(filteredResult);
      },
      toggleCompleted: (isCompleted: TaskType['isCompleted']) => {
        function toggleChildren(task: TaskType, isCompleted: boolean) {
          task.isCompleted = isCompleted;
          if (task.subTasks) {
            task.subTasks = task.subTasks.map((item) => toggleChildren(item, isCompleted));
          }

          return task;
        }

        traverse(
            tasksList,
            path,
            (item) => {
              if (item.id === targetId) {
                item = toggleChildren(item, isCompleted);
              }

              return item;
            }
        );

        setProjects(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.map((item) => item.id === targetId ? {...item, isCompleted} : item);
        setFilteredTasks(filteredResult);
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

    setFilteredTasks(searchResult);
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

    function getFlatIdsArray(tasksList: TaskType[]): string[] {
      return tasksList.reduce((acc, task) => {
        const ret = task.subTasks ? getFlatIdsArray(task.subTasks) : [];

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
      const flatIdList = getFlatIdsArray(parsedJSON);
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
    handleChangeProjectTitle,
    handleAddNewTask,
    handleTask,
    filteredTasks,
    setFilteredTasks,
    handleSearch,
    handleSwapTasks,
    handleImport,
    importError,
    setImportError,
  };
};

export default useTaskTracker;
