import React from 'react';
import {Header} from 'components';
import {ProjectCreator} from 'features/TaskTracker';

const LayoutHeader = (): JSX.Element => {
  return (
    <Header>
      <ProjectCreator />
    </Header>
  );
};

export default LayoutHeader;
