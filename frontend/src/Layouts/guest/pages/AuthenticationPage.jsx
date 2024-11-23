import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Container,
  Group,
  Button,
  Loader
} from '@mantine/core';

import classes from './../styles/Authentication.module.css';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from "react-router-dom";

import { useUserContext } from "../../../context/userContext";
import { ADMIN_DASHBOARD_ROUTE, AGENT_DASHBOARD_ROUTE } from '../../../Router';
import { useEffect, useState } from 'react';



export default function AuthenticationPage() {

  const navigate = useNavigate();

  const {login , authenticated , setAuthenticated , setToken , setRefreshToken , setTokenSetTime } = useUserContext() ;
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state


  const form = useForm({
    initialValues: { email: 'admin@gmail.com', password: 'admin@gmail.com' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'email is required'),
      password: (value) => (value.length < 8 ? 'password is required' : null),
    },
  });



  const handleError = (errors) => {
    if (errors.email) {
      notifications.show({ message: 'guest-guestPages-Authentication-email-error-toast' , color: 'red' });
    } else if (errors.password) {
      notifications.show({ message: 'guest-guestPages-Authentication-password-error-toast' , color: 'red' });
    }
  };





  // Submit handler
  const handleSubmit = async ({ email, password }) => {
    setIsLoading(true); // Set loading state to true
    try {
      const { status , data } = await login(email, password); // get it from Context Api
      if (status === 200) {

        // console.log('stutus = ' + status)
        const { role } = data.user;
        localStorage.setItem('role', role);
        setAuthenticated(true);
        setToken(data.token);
        setRefreshToken(data.refresh_token)
        setTokenSetTime(Date.now() + (25 * 60 * 1000)) // set time for now + 25 min

        if (role === 'admin') {
          navigate(ADMIN_DASHBOARD_ROUTE);
        } else if (role === 'agent') {
          navigate(AGENT_DASHBOARD_ROUTE);
        }

      }
    } catch (reason) {
      notifications.show({ message: reason.response.data.message , color: 'red' });
    } finally {
      setIsLoading(false); 
    }
  };



  // Send to  dashboard if auth = true if user want to play with urls 
  useEffect(() => {
    if (authenticated) {
        const role =  window.localStorage.getItem('role') ;
        if (role === 'admin'){
          navigate(ADMIN_DASHBOARD_ROUTE);
        }else if(role === 'agent') {
          navigate(AGENT_DASHBOARD_ROUTE);
        }
    }
  }, []);




  return (
    <Container size={520} my={100}>
      <Title ta="center" className={classes.title}>
        
        {'Welcome Back !'}

      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
          

          <TextInput
            withAsterisk
            mt="sm"
            label={'email'}
            placeholder={'email'}
            {...form.getInputProps('email')}
          />


          <PasswordInput
            withAsterisk
            label={'password'}
            placeholder={'password'}
            {...form.getInputProps('password')}
            mt="md"
          />


          <Group justify="space-between" mt="lg">
            <Anchor
            size="sm">Forgot password ?</Anchor>
          </Group>
          
          {isLoading ? 
            <Button disabled type="submit" mt="xl" fullWidth>
              <Loader type="dots" />
            </Button>
          :
            <Button type="submit" mt="xl" fullWidth>
              submit
            </Button>
          }
          

        </form>
      </Paper>
    </Container>
  );
}
