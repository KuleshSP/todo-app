import {useState} from 'react';
import {tryParseJSONObject} from 'utils/json';
import {removeWhitespaces} from 'utils/text';
import {TaskType, ProjectType, TasksList} from './types';
import {traverse} from './utils';

const useProject = (project: ProjectType | undefined, setProject: (project: ProjectType) => void) => {
  const [filteredTasks, setFilteredTasks] = useState<TasksList>([]);
  const [importError, setImportError] = useState<string | undefined>(undefined);

  const handleChangeProjectTitle = (title: ProjectType['title']) => {
    if (project === undefined) return;

    project.title = title;

    setProject(project);
  };

  const handleAddNewTask = (description: string, id: string) => {
    if (project === undefined) return;

    project.tasksList.push({id, description, isCompleted: false});

    setProject(project);
  };

  const handleTask = (path: string[]) => {
    const copy: ProjectType = JSON.parse(JSON.stringify(project));

    const filteredCopy: TasksList = JSON.parse(JSON.stringify(filteredTasks));
    const targetId = path[path.length - 1];

    return {
      addSubtask: (newSubTask: TaskType) => {
        const ret = traverse(
            copy.tasksList,
            path,
            (item) => {
              if (item.id === targetId) {
                return {
                  ...item,
                  subTasks: item.subTasks ? [...item.subTasks, newSubTask] : [newSubTask],
                };
              }

              return item;
            }
        );

        copy.tasksList = ret;

        setProject(copy);
      },
      remove: () => {
        const ret = traverse(
            copy.tasksList,
            path,
            (item) => item.id === targetId ? undefined : item,
        );

        copy.tasksList = ret;

        setProject(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.filter((item) => item.id !== targetId);
        setFilteredTasks(filteredResult);
      },
      toggleCompleted: (isCompleted: TaskType['isCompleted']) => {
        function toggleDescendants(task: TaskType, isCompleted: boolean) {
          task.isCompleted = isCompleted;

          if (task.subTasks) {
            task.subTasks = task.subTasks.map((item) => toggleDescendants(item, isCompleted));
          }

          return task;
        }

        traverse(
            copy.tasksList,
            path,
            (item) => {
              if (item.id === targetId) {
                item = toggleDescendants(item, isCompleted);
              }

              return item;
            }
        );

        setProject(copy);

        if (filteredCopy.length === 0) return;

        const filteredResult = filteredCopy.map((item) => item.id === targetId ? {...item, isCompleted} : item);
        setFilteredTasks(filteredResult);
      },
    };
  };

  const handleSearch = (value: string) => {
    const copy: ProjectType = JSON.parse(JSON.stringify(project));

    copy.filters.search = value;

    setProject(copy);

    function getFlatList(tasks: TasksList | undefined): TasksList {
      if (tasks === undefined) return [];

      return tasks.reduce((acc, item) => [...acc, item, ...getFlatList(item.subTasks)], [] as TasksList);
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

  const handleSwapTasks = (indexX: number, indexY: number) => {
    const copy: ProjectType = JSON.parse(JSON.stringify(project));
    const currentProjectTasks = copy.tasksList;

    const removed = currentProjectTasks.splice(indexX, 1);

    currentProjectTasks.splice(indexY, 0, removed[0]);

    setProject(copy);
  };

  const handleImport = (value: string, onSuccess: () => void) => {
    function checkTasksList(tasksList: TasksList): TasksList {
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
      }, [] as TasksList);
    }

    function getFlatIdsArray(tasksList: TasksList): string[] {
      return tasksList.reduce((acc, task) => {
        const ret = task.subTasks ? getFlatIdsArray(task.subTasks) : [];

        return [...acc, task.id, ...ret];
      }, [] as string[]);
    }

    try {
      const parsedJSON: TasksList = tryParseJSONObject(value);

      if (Array.isArray(parsedJSON) === false) {
        throw new Error('Tasks must be an array');
      }

      const copy: ProjectType = JSON.parse(JSON.stringify(project));

      const tasksListClean = checkTasksList(parsedJSON);
      const flatIdList = getFlatIdsArray(parsedJSON);
      const withoutDuplicates = [...new Set(flatIdList)];

      if (flatIdList.length !== withoutDuplicates.length) {
        throw new Error('Duplicate id found');
      }

      copy.tasksList = tasksListClean;

      setProject(copy);
      onSuccess();
    } catch (e: unknown) {
      console.error(e);

      const message = e instanceof Error ? e.message : String(e);

      setImportError(message);
    }
  };

  return {
    project,
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

export default useProject;
