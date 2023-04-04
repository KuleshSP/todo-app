import classes from './styles.module.scss';

const LayoutMain = (props: React.PropsWithChildren) => {
  const {children} = props;

  return <main className={classes.layoutMain}>{children}</main>;
};

export default LayoutMain;
