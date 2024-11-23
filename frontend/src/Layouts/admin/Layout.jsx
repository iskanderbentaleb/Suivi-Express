import { Outlet } from "react-router-dom";
import { AppShell, Group , Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './components/Navbar';

function Layout() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <div>
            <AppShell
                header={{ height: 50 }}
                navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                padding="md"
            >
                <AppShell.Header bg="#242f47">
                    <Group 
                        h="100%" 
                        px="lg" 
                        position="center" 
                        fw={800}
                        style={{ color:"white" , fontSize:"20px" , width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        E-commerce Call Center Management
                    </Group>
                </AppShell.Header>
                <AppShell.Navbar p="md">
                    <Navbar/>
                </AppShell.Navbar>
                
                <AppShell.Main>
                    <div style={{ background: '#0000000c', height: '92vh', width: '100%' }}>
                        {/* <Outlet/> */}
                    </div>
                </AppShell.Main>


            </AppShell>
        </div>
    );
}

export default Layout;
