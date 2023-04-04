import {Button} from 'components';
import ITimes from 'icons/ITimes';
import {useState, useRef, useEffect} from 'react';
import {removeWhitespaces} from 'utils/text';
import {ProjectType} from '../services/types';
import {useTaskTrackerContext} from '../TackTrackerContext';
import classes from './styles.module.scss';

type TaskTrackerTransferModalProps = {
  project?: ProjectType;
}

const TaskTrackerTransferModal = (props: TaskTrackerTransferModalProps) => {
  const {project} = props;
  const {handleImport, importError, setImportError} = useTaskTrackerContext();
  const [isTransferModalShown, toggleTransferModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (project === undefined) return;

    if (isTransferModalShown) {
      ref.current?.focus();
      setInputValue(JSON.stringify(project.tasksList, null, 4));
    } else {
      setInputValue('');
      setImportError(undefined);
    }
  }, [isTransferModalShown]);

  return (
    <>
      <Button onClick={() => toggleTransferModal(true)}>Import/Export</Button>

      {isTransferModalShown && (
        <div className={classes.transferModal}>
          <header>
            <h6 className={classes.modalHeader}>Import/Export</h6>
            <Button variant='text' onClick={() => toggleTransferModal(false)} className={classes.closeModalButton}><ITimes/></Button>
          </header>

          <main>
            <textarea
              className={classes.transferTextarea}
              ref={ref}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setImportError(undefined);
              }}
              rows={30}
            />

            <p className={classes.errorText}>
              {importError}
            </p>
          </main>

          <footer>
            <div className={classes.actionsWrapper}>
              <Button variant='text' onClick={() => navigator.clipboard.writeText(inputValue)}>Copy</Button>
              <Button
                onClick={() => {
                  const cleanValue = removeWhitespaces(inputValue);

                  if (cleanValue.length === 0 || !project) {
                    setImportError('Field should not be empty');
                    return;
                  }

                  handleImport(cleanValue, project.id, () => toggleTransferModal(false));
                }}
              >
                Save
              </Button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default TaskTrackerTransferModal;
