import 'normalize.css';
import 'the-new-css-reset/css/reset.css';
import 'styles/globals.scss';
import type {AppProps} from 'next/app';
import Layout from 'features/Layout';
import TaskTrackerProvider from 'features/TaskTracker/TaskTrackerProvider';
import {useEffect, useState} from 'react';
import {ProjectsListType} from 'features/TaskTracker/services/types';

export default function App({Component, pageProps}: AppProps) {
  const [projects, setProjects] = useState<ProjectsListType | undefined>(undefined);

  useEffect(() => setProjects(JSON.parse(localStorage.getItem('projects') || 'null')), []);

  return (
    <TaskTrackerProvider projects={projects}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </TaskTrackerProvider>
  );
}
