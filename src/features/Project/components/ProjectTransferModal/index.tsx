import {Button} from 'components';
import ITimes from 'icons/ITimes';
import {useState, useRef, useEffect} from 'react';
import {removeWhitespaces} from 'utils/text';
import classes from './styles.module.scss';
import {useProjectContext} from '../../services/ProjectContext';

const ProjectTransferModal = () => {
  const {project, handleImport, importError, setImportError} = useProjectContext();
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

                  handleImport(cleanValue, () => toggleTransferModal(false));
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

export default ProjectTransferModal;
