import React, {InputHTMLAttributes} from 'react';
import {ComponentBaseProps} from 'types/components';
import classes from './styles.module.scss';
import cx from 'classnames';

type TextInputProps = ComponentBaseProps & InputHTMLAttributes<HTMLInputElement>;

const TextInput = React.forwardRef((props: TextInputProps, ref: React.ForwardedRef<HTMLInputElement | null>) => {
  const {className, ...rest} = props;

  return (
    <input ref={ref} className={cx(classes.input, className)} {...rest} />
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
