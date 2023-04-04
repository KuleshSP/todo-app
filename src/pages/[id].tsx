import {Paper} from 'components';
import {Project} from 'features/TaskTracker';
import {useTaskTrackerContext} from 'features/TaskTracker/TackTrackerContext';

import {useRouter} from 'next/router';

export default function ProjectPage() {
  const router = useRouter();
  const {projects} = useTaskTrackerContext();


  return (
    <Paper>
      <Project project={projects ? projects[router.query.id as string] : undefined} />
    </Paper>
  );
}
