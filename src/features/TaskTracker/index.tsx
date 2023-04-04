import {Button, TextInput} from 'components';
import Link from 'next/link';
import {useState, useRef, useEffect} from 'react';
import {removeWhitespaces} from 'utils/text';
import {getSmallUUID} from 'utils/uuid';
import {ProjectType} from './services/types';

import classes from './styles.module.scss';
import {useTaskTrackerContext} from './TackTrackerContext';
import {TasksSearch, TasksList} from './TaskTrackerComponents';
import TransferModal from './TaskTrackerTransferModal';

export const ProjectsList = () => {
  const {projects, handleRemoveProject} = useTaskTrackerContext();

  return (
    <div className={classes.projectListBox}>
      {projects && Object.entries(projects).map(([, value], index) => {
        const {id, title} = value;

        return (
          <div key={id} className={classes.projectListItem} style={{borderBottom: `1px solid hsl(${(index + 1) * 10}, 100%,50%)`}}>
            <Link className={classes.projectListItemLink} href={`/${id}`} rel="noopener noreferrer" target="_blank">{title}</Link>
            <Button variant='text' onClick={() => handleRemoveProject(id)}>Remove</Button>
          </div>
        );
      })}
    </div>);
};

export const ProjectCreator = () => {
  const [isInputShown, toggleInput] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const {handleCreateNewProject} = useTaskTrackerContext();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    isInputShown && ref.current?.focus();
  }, [isInputShown]);

  return (
    <div className={classes.createNewProjectBox}>
      {isInputShown ?
       (<form
         className={classes.createNewProjectForm}
         onSubmit={(e) => {
           e.preventDefault();

           const withoutWhitespaces = removeWhitespaces(inputValue);
           if (withoutWhitespaces.length === 0) return;

           toggleInput(false);
           const smallId = getSmallUUID();

           handleCreateNewProject({id: smallId, title: withoutWhitespaces});

           window.open(`/${smallId}`, '_blank');

           setInputValue('');
         }}
       >
         <TextInput ref={ref} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Project title"/>
         <Button type="submit">Create</Button>
         <Button
           variant='text'
           onClick={() => {
             toggleInput(false);
             setInputValue('');
           }}
         >
          Cancel
         </Button>
       </form>) :
       (<Button onClick={() => toggleInput((prev) => !prev)}>Create new project</Button>)
      }
    </div>
  );
};

type ProjectProps = {
  project?: ProjectType;
}

export const Project = (props: ProjectProps) => {
  const {project} = props;
  const {handleAddNewTask, filteredProjects, handleChangeProjectTitle} = useTaskTrackerContext();

  const [newTaskValue, setNewTaskValue] = useState('');
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

              handleChangeProjectTitle({id, title: titleInputValue});
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

        <TransferModal project={project} />

        <TasksSearch project={project} />
      </div>

      <TasksList
        projectId={id}
        isFiltersApplied={!!search}
        tasksList={!!search ? filteredProjects : tasksList}
        errorMsg={!!search && filteredProjects.length === 0 ? 'Nothing found' : undefined}
      />

      <form
        className={classes.addNewTaskForm}
        onSubmit={(e) => {
          e.preventDefault();

          const withoutWhitespaces = removeWhitespaces(newTaskValue);

          if (withoutWhitespaces.length === 0) return;

          const smallId = getSmallUUID();
          handleAddNewTask(id, withoutWhitespaces, smallId);
          setNewTaskValue('');
        }}
      >
        <TextInput value={newTaskValue} onChange={(e) => setNewTaskValue(e.target.value)} placeholder='Add new task'/>
        {removeWhitespaces(newTaskValue).length !== 0 && <Button type='submit'>Add</Button>}
      </form>
    </div>
  );
};
