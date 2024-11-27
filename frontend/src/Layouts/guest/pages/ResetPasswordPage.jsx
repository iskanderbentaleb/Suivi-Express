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
    initialValues: { password: 'iskanderboss1999@gmail.com', password_confirmation: 'iskanderboss1999@gmail.com' },
    validate: {
      password: (value) => (value.length < 8 ? 'Password must be at least 8 characters.' : null),
      password_confirmation: (value, values) =>
        value !== values.password ? 'Passwords do not match.' : null,
    },
  });



  const handleError = (errors) => {
    if (errors.password) {
      notifications.show({message: 'Password is required. Please enter your password.',color: 'red',});
    }else if(errors.password_confirmation){
      notifications.show({message: 'Password confermation is required. Please enter your password.',color: 'red',});
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
        
        {'Reset your password'}

      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit, handleError)}>
          

          <PasswordInput
            withAsterisk
            label={'password'}
            placeholder={'password'}
            {...form.getInputProps('password')}
            mt="md"
          />

          <PasswordInput
            withAsterisk
            label={'password confirmation'}
            placeholder={'password confirmation'}
            {...form.getInputProps('password_confirmation')}
            mt="md"
          />


          <Group justify="space-between" mt="lg">
            <Anchor
            onClick={()=>{
              navigate(LOGIN_ROUTE);
            }}
            size="sm">Login ?</Anchor>
          </Group>
          
          {isLoading ? 
            <Button disabled type="submit" mt="xl" fullWidth>
              <Loader type="dots" />
            </Button>
          :
            <Button type="submit" mt="xl" fullWidth>
              Change Password
            </Button>
          }
          

        </form>
      </Paper>
    </Container>
  );
}
