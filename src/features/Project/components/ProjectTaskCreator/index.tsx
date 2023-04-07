import {TextInput, Button} from 'components';
import {useState} from 'react';
import {removeWhitespaces} from 'utils/text';
import {getSmallUUID} from 'utils/uuid';
import {useProjectContext} from '../../services/ProjectContext';
import classes from './styles.module.scss';

const ProjectTaskCreator = () => {
  const {
    handleAddNewTask,
  } = useProjectContext();

  const [newTaskValue, setNewTaskValue] = useState('');

  return (
    <form
      className={classes.addNewTaskForm}
      onSubmit={(e) => {
        e.preventDefault();

        const withoutWhitespaces = removeWhitespaces(newTaskValue);

        if (withoutWhitespaces.length === 0) return;

        const smallId = getSmallUUID();
        handleAddNewTask(withoutWhitespaces, smallId);
        setNewTaskValue('');
      }}
    >
      <TextInput value={newTaskValue} onChange={(e) => setNewTaskValue(e.target.value)} placeholder='Add new task'/>
      {removeWhitespaces(newTaskValue).length !== 0 && <Button type='submit'>Add</Button>}
    </form>
  );
};

export default ProjectTaskCreator;
