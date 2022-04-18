import Footer from '@components/Footer';
import Header from '@components/Header';
import Head from 'next/head';
import React from 'react';
import styles from './Layout.module.scss';

const Layout: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
  ...rest
}) => {
  let layoutClassName = styles.layout;

  if (className) {
    layoutClassName = `${layoutClassName} ${className}`;
  }

  return (
    <div className={layoutClassName} {...rest}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
