import { Outlet , useNavigate } from "react-router-dom";
import { AppShell, Group , Burger ,  Grid , Loader, Center} from '@mantine/core';
import { useUserContext } from "../../context/userContext";
import Navbar from './components/Navbar';
import { useEffect, useState } from "react";
import { LOGIN_ROUTE } from "../../Router";
import { guestApi } from "../../Services/Api/guest/guestApi";

function Layout() {
    const {DahboardOpend, setDahboardOpend ,  authenticated, setAuthenticated, setToken, setRefreshToken, setTokenSetTime, setUser } = useUserContext();
    const [Loaded, setLoaded] = useState(false);
    const navigate = useNavigate();
  


    const logout = () => {
        setLoaded(true); // remove loader and logout 
        setAuthenticated(false)
        navigate(LOGIN_ROUTE);
    }
  

    

    const fetchAdminInformation = async () => {

        if (!authenticated) {
          navigate(LOGIN_ROUTE);
          return;
        }
    
        try {
          const response = await guestApi.getUser('admin');
          setUser(response.data);
          setLoaded(true);
          window.localStorage.setItem('role', response.data.role);
          return response.status;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            return 401; // Unauthorized
          } else {
            console.log('logout from <fetchAdminInformation> ');
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

        const response = await guestApi.refreshToken(refreshToken, expiredToken);

        
        const { token , refresh_token } = response.data;
        setToken(token);
        setRefreshToken(refresh_token);
        setTokenSetTime(Date.now() + (25 * 60 * 1000)); // Set time for now + 25 min
        const status = await fetchAdminInformation();
        if (status !== 401) {
            return status;
        }
        return 401; // Default to 401 if refresh failed
    };





    const checkTokenExpiry = async () => {

        const refreshToken = localStorage.getItem('RefreshToken');
        const tokenSetTime = localStorage.getItem('TokenSetTime');
        const now = Date.now();
    
        const statusResponse = await fetchAdminInformation();
        // console.log(statusResponse)
    
        if (tokenSetTime && refreshToken) {
          if (tokenSetTime - now < 5 * 60 * 1000 || statusResponse === 401) { // 5 minutes before expiry or if status is 401
            try {
              await refreshTokenAndRetry();
            } catch (error) {
              // this if the refresh responce with 401 : unothorized 
              logout()
            }
          }
        } else {
          logout()
        }
      };

      

    useEffect(() => {
        // Check token expiry on mount
        checkTokenExpiry();
    
        // Set interval to check token expiry every 5 minutes 
        const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);
    
        // if is unmounted clear interval 
        return () => clearInterval(interval);
      }, []);
    
    


    if (Loaded === false) {
        return (
          <Center h="100vh">
            <Loader color="themeColor.9" type="bars" />
          </Center>
        );
      }


    return (
        <div>
            <AppShell
                header={{ height: 50 }}
                navbar={{ width: 340, breakpoint: 'sm', collapsed: { mobile: !DahboardOpend } }}
                padding="md"
            >
                <AppShell.Header style={{ background:'#1a1f2e' , display: 'flex', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                    <Group h="100%" px="md" style={{ position: 'absolute', left: 0 }}>
                        <Burger color="white" 
                        opened={DahboardOpend}
                        onClick={() => setDahboardOpend(!DahboardOpend)}
                        hiddenFrom="sm" 
                        size="sm" />
                    </Group>
                    <div style={{ color: 'white' }}>
                        E-Commerce Call Center
                    </div>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <Navbar/>
                </AppShell.Navbar>
                
                <AppShell.Main style={{background:'#f8f9fa'}}>
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
