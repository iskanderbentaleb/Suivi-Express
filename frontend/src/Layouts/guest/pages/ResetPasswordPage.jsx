import {
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
import { useNavigate , useLocation } from "react-router-dom";

import { useUserContext } from "../../../context/userContext";
import { ADMIN_DASHBOARD_ROUTE, AGENT_DASHBOARD_ROUTE, LOGIN_ROUTE } from '../../../Router';
import { useEffect, useState } from 'react';



export default function ResetPasswordPage() {

  const navigate = useNavigate();
  const location = useLocation(); 

  const { reset_password , authenticated } = useUserContext() ;
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state


  const form = useForm({
    initialValues: { 
      password: 'iskanderboss1999@gmail.com', 
      password_confirmation: 'iskanderboss1999@gmail.com' 
    },
    validate: {
      password: (value) => (value.length < 8 ? 'Le mot de passe doit contenir au moins 8 caractères.' : null),
      password_confirmation: (value, values) =>
        value !== values.password ? 'Les mots de passe ne correspondent pas.' : null,
    },
  });
  



  const handleError = (errors) => {
    if (errors.password) {
      notifications.show({message: 'Le mot de passe est requis. Veuillez entrer votre mot de passe.', color: 'red'});
    } else if (errors.password_confirmation) {
      notifications.show({message: 'La confirmation du mot de passe est requise. Veuillez entrer votre mot de passe.', color: 'red'});
    }
  };
  




  // Submit handler
  const handleSubmit = async ({password,password_confirmation}) => {
    setIsLoading(true); // Set loading state to true
    try {
      
      const queryParams = new URLSearchParams(location.search);

      const token = location.pathname.split('/')[2]; // Extract the token from the URL path
      const email = queryParams.get('email'); // Extract the email from the query parameters
      
      const {status , data} = await reset_password( token , email , password , password_confirmation ); 
      if (status === 200) {
          notifications.show({message: data.status, color: 'green'});
          navigate(LOGIN_ROUTE);
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
        
        {'Réinitialisez votre mot de passe'}

      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
          <PasswordInput
            withAsterisk
            label={'Mot de passe'}
            placeholder={'Mot de passe'}
            {...form.getInputProps('password')}
            mt="md"
          />

          <PasswordInput
            withAsterisk
            label={'Confirmation du mot de passe'}
            placeholder={'Confirmation du mot de passe'}
            {...form.getInputProps('password_confirmation')}
            mt="md"
          />


          <Group justify="space-between" mt="lg">
            <Anchor
            onClick={()=>{
              navigate(LOGIN_ROUTE);
            }}
            size="sm">Se connecter ?</Anchor>
          </Group>
          
          {isLoading ? 
            <Button disabled type="submit" mt="xl" fullWidth>
              <Loader type="dots" />
            </Button>
          :
            <Button type="submit" mt="xl" fullWidth>
              Changer le mot de passe
            </Button>
          }
        </form>
      </Paper>
    </Container>
  );
}
