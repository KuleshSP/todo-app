import {ButtonHTMLAttributes, PropsWithChildren} from 'react';
import {ComponentBaseProps} from 'types/components';
import classes from './styles.module.scss';
import cx from 'classnames';

type ButtonProps = {variant?: 'filled' | 'text'} & PropsWithChildren & ComponentBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = (props: ButtonProps) => {
  const {variant = 'filled', children, className, ...rest} = props;

  return (
    <button className={cx(classes.button, classes[variant], className)} {...rest}>{children}</button>
  );
};

export default Button;
