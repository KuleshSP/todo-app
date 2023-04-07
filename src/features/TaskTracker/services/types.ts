import {ProjectId, ProjectType} from 'features/Project/services/types';
import useTaskTracker from './useTaskTracker';

export type ProjectsListType = Record<ProjectId, ProjectType>;

export type TaskTrackerContextType = ReturnType<typeof useTaskTracker>;
