import {Paper} from 'components';
import {TaskTrackerProjectsList} from 'features/TaskTracker/components';

export default function Home() {
  return (
    <Paper>
      <TaskTrackerProjectsList />
    </Paper>
  );
}
