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

  const [active, setActive] = useState('Billing');

  const data = [
    { link: ADMIN_DASHBOARD_ROUTE , label: 'Dashboard', icon: IconLayoutDashboard },
    { link: ADMIN_NOTIFICATIONS_ROUTE , label: 'Notifications', icon: IconBrandWechat },
    { link: ADMIN_ORDERS_ROUTE , label: 'Orders', icon: IconPackage },
    { link: ADMIN_USERS_ROUTE, label: 'Confirmation Agents', icon:   IconUsers },
    { link: ADMIN_SETTING_ROUTE, label: 'Other Settings', icon: IconSettings },
  ];


  const { logout } = useUserContext() ;

  const navigate = useNavigate()

  const handleLogout = async (event) => {
    event.preventDefault()
    try {
      const { status } = await logout()
      if(status === 200){
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
                  src="https://avatars.githubusercontent.com/u/61707068?s=400&u=8fcaf3d042c60986a6ab62ada33522d5bd69eb8f&v=4"
                  radius="xl"
              />
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