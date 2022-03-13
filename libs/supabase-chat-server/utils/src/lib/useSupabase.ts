import { ChatUser } from '@egghead-examples/supabase-chat-server/types';
import type {
  RealtimeSubscription,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

if (!process.env['NEXT_PUBLIC_SUPABASE_URL']) {
  throw Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!process.env['NEXT_PUBLIC_SUPABASE_API_KEY']) {
  throw Error('NEXT_PUBLIC_SUPABASE_API_KEY is not set');
}
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'],
  process.env['NEXT_PUBLIC_SUPABASE_API_KEY']
);

export type UseSupabaseHoookCurrentUser = ChatUser | undefined | null;

export interface UseSupabaseHook {
  session: Session | null;
  supabase: SupabaseClient;
  currentUser: UseSupabaseHoookCurrentUser;
}

export const useSupabase = (): UseSupabaseHook => {
  const [currentUser, setCurrentUser] =
    useState<UseSupabaseHoookCurrentUser>(undefined);
  const [session, setSession] = useState(supabase.auth.session());

  supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);
  });

  useEffect(() => {
    let updateCurrentUserRealtimeSubscription: RealtimeSubscription;
    const getCurrentUser = async () => {
      if (session?.user?.id) {
        const { data: users } = await supabase
          .from<ChatUser>('user')
          .select('*')
          .eq('id', session.user.id);

        if (users?.length) {
          const currentUser = users[0];
          updateCurrentUserRealtimeSubscription = await supabase
            .from<ChatUser>(`user:id=eq.${currentUser.id}`)
            .on('UPDATE', (payload) => {
              setCurrentUser(payload.new);
            })
            .subscribe();

          setCurrentUser(currentUser);
        } else {
          setCurrentUser(null);
        }
      }
    };

    getCurrentUser();

    return () => {
      if (updateCurrentUserRealtimeSubscription) {
        updateCurrentUserRealtimeSubscription.unsubscribe();
      }
    };
  }, [session]);

  return { session, supabase, currentUser };
};

export default useSupabase;
