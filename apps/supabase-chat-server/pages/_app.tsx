import { ChakraProvider } from '@chakra-ui/react';
import {
  useSupabase,
  UseSupabaseHook,
} from '@egghead-examples/supabase-chat-server/utils';
import { AppProps } from 'next/app';
import Head from 'next/head';

type SupabaseChatProps = AppProps<UseSupabaseHook>;

function SupabaseChat({ Component, pageProps }: SupabaseChatProps) {
  const { session, supabase, currentUser } = useSupabase();

  return (
    <>
      <Head>
        <title>Supabase Chat App</title>
      </Head>
      <ChakraProvider>
        <main>
          <Component
            session={session}
            supabase={supabase}
            currentUser={currentUser}
            {...pageProps}
          />
        </main>
      </ChakraProvider>
    </>
  );
}

export default SupabaseChat;
