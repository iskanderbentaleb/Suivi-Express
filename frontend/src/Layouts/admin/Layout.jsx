import { Outlet } from "react-router-dom";
import { AppShell, Group , Burger ,  Grid} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './components/Navbar';

function Layout() {
    const [opened, { toggle }] = useDisclosure();

    return (
        <div>
            <AppShell
                header={{ height: 50 }}
                navbar={{ width: 340, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                padding="md"
            >
                <AppShell.Header style={{ background:'#1f2132' , display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                    <Group h="100%" px="md" style={{ position: 'absolute', left: 0 }}>
                        <Burger color="white" opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                    </Group>
                    <div style={{ color: 'white' }}>
                        E-commerce Call Center
                    </div>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <Navbar/>
                </AppShell.Navbar>
                
                <AppShell.Main>
                    <Grid>
                        <Grid.Col span={12}>
                            <Outlet/>
                        </Grid.Col>
                    </Grid>
                </AppShell.Main>

            </AppShell>
        </div>
    );
}

export default Layout;
