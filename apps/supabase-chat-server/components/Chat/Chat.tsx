import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  FormControl,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import {
  ChatMessage,
  ChatUser,
} from '@egghead-examples/supabase-chat-server/types';
import { UseSupabaseHook } from '@egghead-examples/supabase-chat-server/utils';
import type { RealtimeSubscription } from '@supabase/supabase-js';
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type ChatProps = Record<string, unknown> & UseSupabaseHook;

const Chat: React.FC<ChatProps> = ({ session, supabase, currentUser }) => {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<string, ChatUser>>({});
  const [editingUsername, setEditingUsername] = useState(false);
  const messageRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const flexColorMode = useColorModeValue('gray.50', 'gray.800');
  const containerColorMode = useColorModeValue('white', 'whiteAlpha.100');
  const inputMessageColorMode = useColorModeValue('gray.300', 'gray.700');

  const username = currentUser?.username
    ? currentUser.username
    : session?.user.email;

  useEffect(() => {
    let insertMessageRealtimeSubscription: RealtimeSubscription;
    let updateUserRealtimeSubscription: RealtimeSubscription;

    const getMessages = async () => {
      const { data: messages, error } = await supabase
        .from<ChatMessage>('message')
        .select('*');

      setMessages(messages);

      insertMessageRealtimeSubscription = await supabase
        .from<ChatMessage>('message')
        .on('INSERT', (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new]);
        })
        .subscribe();

      updateUserRealtimeSubscription = await supabase
        .from<ChatUser>('user')
        .on('UPDATE', (payload) => {
          setUsers((prevUsers) => {
            const user = prevUsers[payload.new.id];

            if (user) {
              return {
                ...prevUsers,
                [payload.new.id]: payload.new,
              };
            } else {
              return prevUsers;
            }
          });
        })
        .subscribe();
    };

    getMessages();

    return () => {
      if (insertMessageRealtimeSubscription) {
        insertMessageRealtimeSubscription.unsubscribe();
      }
      if (updateUserRealtimeSubscription) {
        updateUserRealtimeSubscription.unsubscribe();
      }
    };
  }, [supabase]);

  const getUsersFromSupabase = useCallback(
    async (users, userIds: Set<string>) => {
      const usersToGet = Array.from(userIds).filter((userId) => !users[userId]);

      if (Object.keys(users).length && !usersToGet.length) {
        return users;
      }

      const { data: usersData } = await supabase
        .from<ChatUser>('user')
        .select('id,username')
        .in('id', usersToGet);
      const newUsers = {};

      for (const user of usersData) {
        newUsers[user.id] = user;
      }

      return { ...users, ...newUsers };
    },
    [supabase]
  );

  useEffect(() => {
    if (messages.length) {
      const getUsers = async () => {
        const userIds = new Set(messages.map((message) => message.user_id));
        const newUsers = await getUsersFromSupabase(users, userIds);

        setUsers(newUsers);
      };

      getUsers();
    }
  }, [getUsersFromSupabase, messages, users]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const content = messageRef?.current.value;

    if (content) {
      await supabase
        .from<ChatMessage>('message')
        .insert({ content, user_id: session.user.id });

      messageRef.current.value = '';
    }
  };

  const updateUsername = async (e: FormEvent) => {
    e.preventDefault();

    const newUsername = usernameRef?.current.value;

    if (newUsername) {
      const { error } = await supabase
        .from<ChatUser>('user')
        .upsert({ ...currentUser, username: newUsername });

      console.log(error);

      if (error) {
        toast({
          title: `Error: ${error.code}`,
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }

      usernameRef.current.value = '';
      setEditingUsername(false);

      toast({
        title: 'Success',
        description: 'Username updated.',
        status: 'success',
        duration: 2500,
      });
    }
  };

  const signOut = async () => {
    await supabase
      .from<ChatMessage>('message')
      .delete()
      .eq('user_id', currentUser.id);
    await supabase.auth.signOut();
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={flexColorMode}>
      <Container
        maxW={'container.md'}
        bg={containerColorMode}
        boxShadow={'xl'}
        rounded={'lg'}
        p={6}
        flexDirection={'column'}
      >
        {!currentUser ? (
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        ) : (
          <>
            <HStack
              justifyContent={'space-between'}
              alignItems={'flex-start'}
              mb={5}
            >
              <Heading as={'h2'} fontSize={{ base: 'xl', sm: '2xl' }}>
                Supabase Chat
              </Heading>
              <Box>
                {!editingUsername ? (
                  <HStack as={'form'} spacing={2} onSubmit={updateUsername}>
                    <Box as={'span'}>
                      Welcome, <Text as={'b'}>{username}</Text>
                    </Box>
                    <ButtonGroup spacing={2}>
                      <Button
                        colorScheme={'blue'}
                        type={'button'}
                        size={'sm'}
                        onClick={() => setEditingUsername(true)}
                      >
                        Edit username
                      </Button>
                      <Button
                        colorScheme={'blue'}
                        type={'button'}
                        size={'sm'}
                        onClick={signOut}
                      >
                        Log Out
                      </Button>
                    </ButtonGroup>
                  </HStack>
                ) : (
                  <HStack as={'form'} spacing={2} onSubmit={updateUsername}>
                    <FormControl>
                      <Input
                        variant={'solid'}
                        borderWidth={1}
                        color={'gray.800'}
                        _placeholder={{
                          color: 'gray.400',
                        }}
                        borderColor={inputMessageColorMode}
                        id={'username'}
                        type={'text'}
                        placeholder={username}
                        aria-label={'Username'}
                        ref={usernameRef}
                        size={'sm'}
                        maxW={'200px'}
                      />
                    </FormControl>
                    <ButtonGroup spacing={2}>
                      <Button colorScheme={'blue'} type={'submit'} size={'sm'}>
                        Update
                      </Button>
                      <Button
                        colorScheme={'red'}
                        type={'button'}
                        size={'sm'}
                        onClick={() => setEditingUsername(false)}
                      >
                        Cancel
                      </Button>
                    </ButtonGroup>
                  </HStack>
                )}
              </Box>
            </HStack>

            <Stack direction={{ base: 'column' }} spacing={2} py={2}>
              {messages.map((m) => (
                <Box
                  key={m.id}
                  as={'p'}
                  textAlign={currentUser.id === m.user_id ? 'right' : 'left'}
                >
                  {currentUser.id !== m.user_id ? (
                    <>
                      <Box
                        as={'span'}
                        color={currentUser.id === m.user_id ? 'green' : 'blue'}
                      >
                        {users[m.user_id]?.username ?? 'Anonymus'}
                      </Box>
                      <br />
                    </>
                  ) : null}
                  {m.content}
                </Box>
              ))}
            </Stack>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              as={'form'}
              spacing={3}
              onSubmit={sendMessage}
            >
              <FormControl>
                <Input
                  variant={'solid'}
                  borderWidth={1}
                  color={'gray.800'}
                  _placeholder={{
                    color: 'gray.400',
                  }}
                  borderColor={inputMessageColorMode}
                  id={'message'}
                  type={'text'}
                  placeholder={'Write your message'}
                  aria-label={'Write your message'}
                  ref={messageRef}
                />
              </FormControl>
              <FormControl w={{ base: '100%', md: '40%' }}>
                <Button colorScheme={'blue'} w="100%" type={'submit'}>
                  Send
                </Button>
              </FormControl>
            </Stack>
          </>
        )}
      </Container>
    </Flex>
  );
};

export default Chat;
