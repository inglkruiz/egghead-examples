import '@styles/globals.scss';
import { AppProps } from 'next/app';
import { SnipcartProvider } from 'use-snipcart';

function EcommerceGraphCms({ Component, pageProps }: AppProps) {
  return (
    <SnipcartProvider>
      <Component {...pageProps} />;
    </SnipcartProvider>
  );
}

export default EcommerceGraphCms;
