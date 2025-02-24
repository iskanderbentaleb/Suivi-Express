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
import { ADMIN_DASHBOARD_ROUTE, AGENT_DASHBOARD_ROUTE, FORGOT_PASSWORD_ROUTE } from '../../../Router';
import { useEffect, useState } from 'react';



export default function AuthenticationPage() {

  const navigate = useNavigate();

  const {login , authenticated , setAuthenticated , setToken , setRefreshToken , setTokenSetTime } = useUserContext() ;
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state


  const form = useForm({
    initialValues: { 
      // email: 'iskanderboss1999@gmail.com', 
      // password: 'iskanderboss1999@gmail.com' 
      email: 'houdatata16@gmail.com',
      password: 'houdatata16@gmail.com' 
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'L\'email est requis'),
      password: (value) => (value.length < 8 ? 'Le mot de passe est requis' : null),
    },
  });
  


  const handleError = (errors) => {
    if (errors.email) {
      notifications.show({
        message: 'L\'email est requis. Veuillez saisir votre email.',
        color: 'red',
      });
    } else if (errors.password) {
      notifications.show({
        message: 'Le mot de passe est requis. Veuillez saisir votre mot de passe.',
        color: 'red',
      });
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
        
      {'Bienvenue de retour !'}

      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
          
          <TextInput
            withAsterisk
            mt="sm"
            label={'E-mail'}
            placeholder={'E-mail'}
            {...form.getInputProps('email')}
          />

          <PasswordInput
            withAsterisk
            label={'Mot de passe'}
            placeholder={'Mot de passe'}
            {...form.getInputProps('password')}
            mt="md"
          />

          <Group justify="space-between" mt="lg">
            <Anchor
              onClick={() => {
                navigate(FORGOT_PASSWORD_ROUTE);
              }}
              size="sm"
            >
              Mot de passe oublié ?
            </Anchor>
          </Group>

          {isLoading ? 
            <Button disabled type="submit" mt="xl" fullWidth>
              <Loader type="dots" />
            </Button>
          :
            <Button type="submit" mt="xl" fullWidth>
              Se connecter
            </Button>
          }

        </form>
      </Paper>
    </Container>
  );
}
