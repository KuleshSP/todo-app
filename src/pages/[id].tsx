import {Paper} from 'components';
import ProjectContainer from 'features/Project/components';

import {useRouter} from 'next/router';

export default function ProjectPage() {
  const router = useRouter();

  return (
    <Paper>
      <ProjectContainer projectId={router.query.id as string} />
    </Paper>
  );
}
