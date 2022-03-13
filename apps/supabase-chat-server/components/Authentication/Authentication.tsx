import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  Input,
  Link,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { UseSupabaseHook } from '@egghead-examples/supabase-chat-server/utils';
import { FormEvent, useRef } from 'react';

type AuthenticationProps = Record<string, unknown> &
  Pick<UseSupabaseHook, 'supabase'>;

const Authentication: React.FC<AuthenticationProps> = ({ supabase }) => {
  const toast = useToast();
  const emailRef = useRef<HTMLInputElement>(null);

  const signInWithGithub = () => {
    supabase.auth.signIn({
      provider: 'github',
    });
  };

  const signInWithEmail = async (e: FormEvent) => {
    e.preventDefault();

    const email = emailRef?.current.value;

    if (email) {
      const { user, error } = await supabase.auth.signIn({
        email,
      });

      emailRef.current.value = '';
      console.log(user, error);

      toast({
        description: 'Check your email.',
        status: 'info',
        duration: 2500,
      });
    }
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool <Link color={'blue.400'}>features</Link> ✌️
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <VStack spacing={4} divider={<StackDivider />}>
            <Button
              colorScheme={'blue'}
              onClick={signInWithGithub}
              width={'100%'}
            >
              Sign In with GitHub
            </Button>
            <VStack as={'form'} width={'100%'} onSubmit={signInWithEmail}>
              <FormControl id="email">
                <Input
                  type="email"
                  ref={emailRef}
                  placeholder={'Email address'}
                />
                <FormHelperText>
                  We&apos;ll never share your email.
                </FormHelperText>
              </FormControl>
              <FormControl>
                <Button colorScheme={'blue'} w="100%" type={'submit'}>
                  Send Magic Link
                </Button>
              </FormControl>
            </VStack>
          </VStack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Authentication;
