import styles from './Container.module.scss';

const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
  ...rest
}) => {
  let containerClassName = styles.container;

  if (className) {
    containerClassName = `${containerClassName} ${className}`;
  }

  return (
    <div className={containerClassName} {...rest}>
      {children}
    </div>
  );
};

export default Container;
