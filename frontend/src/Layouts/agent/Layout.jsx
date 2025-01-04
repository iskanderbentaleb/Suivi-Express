import { useNavigate , Outlet} from "react-router-dom";
import { AppShell, Group, Burger, Grid, Loader, Center, Text } from '@mantine/core';
import { useUserContext } from "../../context/userContext";
import Navbar from './components/Navbar';
import { useEffect, useState } from "react";
import { LOGIN_ROUTE } from "../../Router";
import { guestApi } from "../../Services/Api/guest/guestApi";

function Layout() {

    const { DahboardOpend, setDahboardOpend, authenticated, setAuthenticated, setToken, setRefreshToken, setTokenSetTime, setUser } = useUserContext();
    const [Loaded, setLoaded] = useState(false);
    const navigate = useNavigate();

    const logout = () => {
        setAuthenticated(false);
        setLoaded(true);
        navigate(LOGIN_ROUTE);
    };

    const fetchAgentInformation = async () => {
        if (!authenticated) {
            navigate(LOGIN_ROUTE);
            return;
        }

        try {
            const response = await guestApi.getUser('agent');
            setUser(response.data);
            setLoaded(true);
            window.localStorage.setItem('role', response.data.role);
            return response.status;
        } catch (error) {
            if (error.response?.status === 401) {
                return 401; // Unauthorized
            } else {
                console.error('Error fetching user:', error);
                return error.response ? error.response.status : 500;
            }
        }
    };

    const refreshTokenAndRetry = async () => {
        const refreshToken = localStorage.getItem('RefreshToken');
        const expiredToken = localStorage.getItem('Token');
        
        if (!refreshToken || !expiredToken) {
            console.error('No tokens available');
            return 401;
        }

        try {
            const response = await guestApi.refreshToken(refreshToken, expiredToken);
            const { token, refresh_token } = response.data;
            setToken(token);
            setRefreshToken(refresh_token);
            setTokenSetTime(Date.now() + (25 * 60 * 1000)); // Set time for now + 25 min
            const status = await fetchAgentInformation();
            if (status !== 401) {
                return status;
            }
            logout();
            return 401; // Default to 401 if refresh failed
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return 401;
        }
    };

    const checkTokenExpiry = async () => {
        const refreshToken = localStorage.getItem('RefreshToken');
        const tokenSetTime = localStorage.getItem('TokenSetTime');
        const now = Date.now();

        const statusResponse = await fetchAgentInformation();

        if (tokenSetTime && refreshToken) {
            if (tokenSetTime - now < 5 * 60 * 1000 || statusResponse === 401) { 
                try {
                    await refreshTokenAndRetry();
                } catch (error) {
                    logout();
                }
            }
        } else {
            logout();
        }
    };

    useEffect(() => {
        checkTokenExpiry();
        const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (!Loaded) {
        return (
            <Center h="100vh">
                <Loader color="themeColor.9" type="bars" />
            </Center>
        );
    }

    return (
        <AppShell
            header={{ height: 50 }}
            navbar={{ width: 340, breakpoint: 'xl', collapsed: {mobile: !DahboardOpend}  }}
            padding="md"
        >
            <AppShell.Header style={{ background:'#20314cff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Group h="100%" px="md" style={{ position: 'absolute', left: 0 }}>
                    <Burger color="white" opened={DahboardOpend} onClick={() => setDahboardOpend(!DahboardOpend)} hiddenFrom="xl" size="sm" />
                </Group>
                <Text size="xl" fw={900} style={{color:'white'}}>
                    {'SHIP-_-MATE'}
                </Text>
            </AppShell.Header>

            <AppShell.Navbar p="md" 
            style={{
                boxShadow: '0 3px 4px rgba(0, 0, 0, 0.1)', // Optional: Adds a soft shadow around the div
            }}
            >
                <Navbar />
            </AppShell.Navbar>

            <AppShell.Main style={{ background:'#f5f5f5ff'}}>
                <Grid>
                    <Grid.Col span={12}>
                        <Outlet />
                    </Grid.Col>
                </Grid>
            </AppShell.Main>

        </AppShell>
    );
}

export default Layout;
