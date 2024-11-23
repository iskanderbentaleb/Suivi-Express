import { useState } from 'react';
import {
  IconLayoutDashboard,
  IconBrandWechat,
  IconPackage,
  IconLogout,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { Group , UnstyledButton , Text , Avatar } from '@mantine/core';
import classes from './styles/Navbar.module.css';

const data = [
  { link: '', label: 'Dashboard', icon: IconLayoutDashboard },
  { link: '', label: 'Notifications', icon: IconBrandWechat },
  { link: '', label: 'Orders', icon: IconPackage },
  { link: '', label: 'Users', icon:   IconUsers },
  { link: '', label: 'Other Settings', icon: IconSettings },
];

export default function Navbar() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
        
        <UnstyledButton className={classes.user} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
          <Group>
              <Avatar
                  src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
                  radius="xl"
              />
              <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>
                      Harriette Spoonlicker
                  </Text>
                  <Text c="dimmed" size="sm">
                      hspoonlicker@outlook.com
                  </Text>
              </div>
          </Group>
      </UnstyledButton>

        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout color='red' className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}