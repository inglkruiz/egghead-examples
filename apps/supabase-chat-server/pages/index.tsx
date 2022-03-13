import { Container } from '@chakra-ui/react';
import type { UseSupabaseHook } from '@egghead-examples/supabase-chat-server/utils';
import { useEffect, useState } from 'react';
import Authentication from '../components/Authentication/Authentication';
import Chat from '../components/Chat/Chat';

type IndexProps = Record<string, unknown> & UseSupabaseHook;

const Index: React.FC<IndexProps> = ({ session, supabase, currentUser }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!session);
  }, [session]);

  return (
    <Container maxW="container.xl">
      {loggedIn ? (
        <Chat supabase={supabase} session={session} currentUser={currentUser} />
      ) : (
        <Authentication supabase={supabase} />
      )}
    </Container>
  );
};

export default Index;
