import {TaskType, TasksList} from './types';

export function traverse(projectTasks: TasksList, path: string[], callback: (item: TaskType) => TaskType | undefined): TasksList {
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
  }, [] as TasksList);
}
