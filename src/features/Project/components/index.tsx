import {Button, TextInput} from 'components';
import React, {useState, useEffect, useRef} from 'react';
import {removeWhitespaces} from 'utils/text';
import classes from './styles.module.scss';
import {useProjectContext} from '../services/ProjectContext';
import ProjectTransferModal from './ProjectTransferModal';
import ProjectTaskCreator from './ProjectTaskCreator';
import ProjectTasksList from './ProjectTasksList';
import ProjectTasksSearch from './ProjectTasksSearch';
import ProjectProvider from '../services/ProjectProvider';
import {useTaskTrackerContext} from 'features/TaskTracker/services/TackTrackerContext';

const Project = () => {
  const {
    handleChangeProjectTitle,
    project,
    filteredTasks,
  } = useProjectContext();

  const [titleInputValue, setTitleInputValue] = useState('');
  const [isTitleEdit, toggleTitleEdit] = useState(false);

  const resetTitleEditor = () => {
    toggleTitleEdit(false);
    setTitleInputValue('');
  };

  useEffect(() => {
    if (project === undefined) return;

    document.title = project.title;
  }, [project?.title]);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTitleEdit && project !== undefined) {
      ref.current?.focus();
      setTitleInputValue(project.title);
    }
  }, [isTitleEdit]);

  if (project === undefined) {
    return (
      <p>Project has been deleted or does not exist</p>
    );
  }

  const {id, tasksList, title, filters: {search}} = project;

  return (
    <div>
      <div className={classes.projectHeader}>
        {isTitleEdit ? (
          <form
            className={classes.titleEditorForm}
            onSubmit={(e) => {
              e.preventDefault();

              const withoutWhitespaces = removeWhitespaces(titleInputValue);
              if (withoutWhitespaces.length === 0) return;

              handleChangeProjectTitle(titleInputValue);
              resetTitleEditor();
            }}
          >
            <TextInput ref={ref} value={titleInputValue} onChange={(e) => setTitleInputValue(e.target.value)}/>
            <Button type="submit">Apply</Button>
            <Button variant='text' onClick={() => resetTitleEditor()}>Cancel</Button>
          </form>
        ) : (
          <div className={classes.titleEditor}>
            <p className={classes.projectTitle}>{title}</p>
            <Button onClick={() => toggleTitleEdit((prev) => !prev)}>Edit</Button>
          </div>
        )}

        <div className={classes.headerActions}>
          <ProjectTransferModal />

          <ProjectTasksSearch />
        </div>
      </div>

      <ProjectTasksList
        projectId={id}
        isFiltersApplied={!!search}
        tasksList={!!search ? filteredTasks : tasksList}
        errorMsg={!!search && filteredTasks.length === 0 ? 'Nothing found' : undefined}
      />

      <ProjectTaskCreator />
    </div>
  );
};

type ProjectContainerProps = {
  projectId: string;
}

const ProjectContainer = (props: ProjectContainerProps) => {
  const {projectId} = props;
  const {projects, handleUpdateProjects} = useTaskTrackerContext();

  return (
    <ProjectProvider
      project={projects ? projects[projectId] : undefined}
      handleUpdateProjects={handleUpdateProjects}
    >
      <Project />
    </ProjectProvider>
  );
};

export default ProjectContainer;
