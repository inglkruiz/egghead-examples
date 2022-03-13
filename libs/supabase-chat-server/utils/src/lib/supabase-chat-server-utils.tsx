import styles from './supabase-chat-server-utils.module.css';

/* eslint-disable-next-line */
export interface SupabaseChatServerUtilsProps {}

export function SupabaseChatServerUtils(props: SupabaseChatServerUtilsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to SupabaseChatServerUtils!</h1>
    </div>
  );
}

export default SupabaseChatServerUtils;
