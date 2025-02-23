import { useState } from 'react';
import {
  IconLayoutDashboard,
  IconBrandWechat,
  IconPackage,
  IconLogout,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { ADMIN_DASHBOARD_ROUTE , ADMIN_NOTIFICATIONS_ROUTE , ADMIN_ORDERS_ROUTE , ADMIN_USERS_ROUTE , ADMIN_SETTING_ROUTE } from '../../../Router/index';
import { Link } from 'react-router-dom';
import { Group , UnstyledButton , Text , Avatar } from '@mantine/core';
import classes from './styles/Navbar.module.css';
import { useUserContext } from '../../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../../Router';
import { notifications } from '@mantine/notifications';


export default function Navbar() {


  const {setDahboardOpend  ,DahboardOpend , user } = useUserContext();

  const [active, setActive] = useState('Tableau de bord');

  const data = [
    { link: ADMIN_DASHBOARD_ROUTE , label: 'Tableau de bord', icon: IconLayoutDashboard },
    { link: ADMIN_NOTIFICATIONS_ROUTE , label: 'Messages', icon: IconBrandWechat },
    { link: ADMIN_ORDERS_ROUTE , label: 'Commandes', icon: IconPackage },
    { link: ADMIN_USERS_ROUTE, label: 'Agents de confirmation', icon: IconUsers },
    // { link: ADMIN_SETTING_ROUTE, label: 'Autres paramètres', icon: IconSettings },
  ];



  const { logout , setUser , setAuthenticated} = useUserContext() ;


  const navigate = useNavigate()

  const handleLogout = async (event) => {
    event.preventDefault()
    try {
      const { status } = await logout();
      if ( status === 200 ) {
          setUser({})
          setAuthenticated(false)
          window.localStorage.removeItem('TokenSetTime') // remove local storage
          window.localStorage.removeItem('RefreshToken') // remove local storage
          window.localStorage.removeItem('AUTH') // remove local storage
          window.localStorage.removeItem('Token') // remove local storage
          window.localStorage.removeItem('role') // remove local storage
          return navigate(LOGIN_ROUTE)
      }
    } catch (reason) {
      notifications.show({ message: reason.response.data.message , color: 'red' });
    }
  
  }

  

  const links = data.map((item) => (
      <Link
        className={classes.link}
        data-active={item.label === active || undefined}
        onClick={() => {
          setDahboardOpend(!DahboardOpend)
          setActive(item.label);
        }}
        to={item.link}
        key={item.label}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header}  justify="space-between">
        
        <UnstyledButton className={classes.user} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
          <Group>
              <Avatar
                radius="sm"
                color="blue" // Optional: Set a background color
              >
                {user.name.charAt(0).toUpperCase() + user.name.charAt(user.name.length - 1).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>{user.name}</Text>
                  <Text c="dimmed" size="sm">{user.email}</Text>
              </div>
          </Group>
      </UnstyledButton>

        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout color='red' className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}