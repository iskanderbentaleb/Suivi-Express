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
import { ADMIN_DASHBOARD_ROUTE, AGENT_DASHBOARD_ROUTE, LOGIN_ROUTE } from '../../../Router';
import { useEffect, useState } from 'react';



export default function ForgotPasswordPage() {

  const navigate = useNavigate();

  const {forgot_password , authenticated } = useUserContext() ;
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state


  const form = useForm({
    initialValues: { email: 'iskanderboss1999@gmail.com' },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "L'email est requis"),
    },
  });
  
  const handleError = (errors) => {
    if (errors.email) {
      notifications.show({
        message: "L'email est requis. Veuillez entrer votre email.",
        color: 'red',
      });
    }
  };
  

  // Submit handler
  const handleSubmit = async ({ email }) => {
    setIsLoading(true); // Set loading state to true
    try {
      const { status, data } = await forgot_password(email); // API call
      if (status === 200) {
        // Show success notification
        notifications.show({ 
          message: data.status, // Adjusted to match response structure
          color: 'green' 
        });
      }
    } catch (error) {
      // Handle error and show notification
      const errorMessage = error.response?.data?.message || "Une erreur inattendue s'est produite";
      notifications.show({ 
        message: errorMessage, 
        color: 'red' 
      });
    } finally {
      setIsLoading(false); // Reset loading state
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
        {'Mot de passe oublié'}
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
        <Group justify="space-between" mt="lg">
          <Anchor
            onClick={() => {
              navigate(LOGIN_ROUTE);
            }}
            size="sm"
          >
            Se connecter ?
          </Anchor>
        </Group>
        {isLoading ? (
          <Button disabled type="submit" mt="xl" fullWidth>
            <Loader type="dots" />
          </Button>
        ) : (
          <Button type="submit" mt="xl" fullWidth>
            Envoyer
          </Button>
        )}
        </form>

      </Paper>
    </Container>
  );
}
