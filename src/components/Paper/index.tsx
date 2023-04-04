import classes from './styles.module.scss';
const Paper = (props: React.PropsWithChildren) => {
  const {children} = props;

  return <main className={classes.paper}>{children}</main>;
};

export default Paper;
