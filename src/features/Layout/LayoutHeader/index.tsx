import React from 'react';
import {Header} from 'components';
import {TaskTrackerProjectCreator} from 'features/TaskTracker/components';

const LayoutHeader = (): JSX.Element => {
  return (
    <Header>
      <TaskTrackerProjectCreator />
    </Header>
  );
};

export default LayoutHeader;
