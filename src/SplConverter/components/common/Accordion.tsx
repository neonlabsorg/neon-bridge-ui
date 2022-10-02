import { useStatesContext } from '@/contexts/states';
import { ReactComponent as CheckIcon } from '@/assets/check.svg';
import { useMemo } from 'react';

const Accordion = (props) => {
  const {
    stepNumber = 1, finished = false, title = '', className = '', stepKey = '',
    active = false, children = <></>, resultsView = <></>
  } = props;
  const { setStepActive } = useStatesContext();
  const handleOpenContent = () => {
    if (finished || !active) {
      setStepActive(stepKey);
    }
  };

  const stepStyles = { width: '27px', minWidth: '27px', height: '27px' };

  const titleClassName = useMemo(() => {
    return `text-2xl leading-none${finished ? ' cursor-pointer text-blue-900 underline' : ''}${!active ? ' dark:text-dark-200' : ''}`;
  }, [finished, active]);

  const stepClassName = useMemo(() => {
    return `rounded-full bg-blue-700 text-white flex items-center justify-center mr-4 ${!active ? 'dark:bg-dark-200' : ''}`;
  }, [active]);

  return <div className={`w-full bg-white dark:bg-dark-600 p-10 ${className}`}>
    <div className='flex w-full flex-col'>
      <div className='flex items-center mb-6'>
        <div className={stepClassName} style={stepStyles}>
          {finished ? <CheckIcon /> : stepNumber}
        </div>
        <h3 className={titleClassName} onClick={handleOpenContent}>{title}</h3>
      </div>
      <div className='flex flex-col'>{active ? children : finished ? resultsView : null}</div>
    </div>
  </div>;
};

export { Accordion };
