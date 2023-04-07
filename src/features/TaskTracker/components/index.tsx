import {Button, TextInput} from 'components';
import Link from 'next/link';
import {useState, useRef, useEffect} from 'react';
import {removeWhitespaces} from 'utils/text';
import {getSmallUUID} from 'utils/uuid';

import classes from './styles.module.scss';
import {useTaskTrackerContext} from '../services/TackTrackerContext';

export const TaskTrackerProjectsList = () => {
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

export const TaskTrackerProjectCreator = () => {
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
