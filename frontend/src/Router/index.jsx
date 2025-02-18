import {createBrowserRouter} from 'react-router-dom'
import Layout from '../Layouts/guest/Layout'
import LayoutAdmin from '../Layouts/admin/Layout'
import LayoutAgent from '../Layouts/agent/Layout'

// ===================== SHARED PAGES =====================
import AuthenticationPage from '../Layouts/guest/pages/AuthenticationPage'
import ForgotPasswordPage from '../Layouts/guest/pages/ForgotPasswordPage'
import ResetPasswordPage from '../Layouts/guest/pages/ResetPasswordPage'
import Error404 from '../Layouts/pages_general/pages/Error404'
// ===================== SHARED PAGES =====================

// ===================== ADMIN PAGES =====================  
import Dashboard from '../Layouts/admin/pages/Dashboard'
import Messages from '../Layouts/admin/pages/Messages/Messages'
import Orders from '../Layouts/admin/pages/Orders/index'
import Setting from '../Layouts/admin/pages/Setting'
import Agents from '../Layouts/admin/pages/agents/index'
// ===================== ADMIN PAGES ===================== 

// ===================== AGENT PAGES =====================
import Dashboard_Agent from '../Layouts/agent/pages/Dashboard'
import Messages_Agent from '../Layouts/agent/pages/Messages/Messages'
import Orders_Agent from '../Layouts/agent/pages/Orders/index'
import Setting_Agent from '../Layouts/agent/pages/Setting'
// ===================== AGENT PAGES =====================




// ===================== SHARED ROUTES =====================
export const LOGIN_ROUTE = '/'
export const FORGOT_PASSWORD_ROUTE = '/forgot-password'
export const RESET_PASSWORD_ROUTE = '/password-reset'
// ===================== SHARED ROUTES =====================

// ===================== ADMIN ROUTES =====================
export const ADMIN_ROUTE = '/admin'
export const ADMIN_DASHBOARD_ROUTE = ADMIN_ROUTE + '/dashboard'
export const ADMIN_NOTIFICATIONS_ROUTE = ADMIN_ROUTE + '/messages/'
export const ADMIN_ORDERS_ROUTE = ADMIN_ROUTE + '/orders/'
export const ADMIN_USERS_ROUTE = ADMIN_ROUTE + '/agents/'
export const ADMIN_SETTING_ROUTE = ADMIN_ROUTE + '/setting/'
// ===================== ADMIN ROUTES =====================

// ===================== AGENT ROUTES =====================
export const AGENT_ROUTE = '/agent'
export const AGENT_DASHBOARD_ROUTE = AGENT_ROUTE + '/dashboard'
export const AGENT_NOTIFICATIONS_ROUTE = AGENT_ROUTE + '/messages/'
export const AGENT_ORDERS_ROUTE = AGENT_ROUTE + '/orders/'
export const AGENT_USERS_ROUTE = AGENT_ROUTE + '/agents/'
export const AGENT_SETTING_ROUTE = AGENT_ROUTE + '/setting/'
// ===================== AGENT ROUTES =====================



export const router = createBrowserRouter(
    [

    // shared with all users
    {
        element:<Layout/>,
        children:[
            {
                path: LOGIN_ROUTE,
                element:<AuthenticationPage/>
            },
            {
                path: FORGOT_PASSWORD_ROUTE,
                element:<ForgotPasswordPage/>
            },
            {
                path: `${RESET_PASSWORD_ROUTE}/:token` ,
                element:<ResetPasswordPage/>
            },
            {
                path:'*',
                element:<Error404/>
            },
        ]
    },


    // Admin pages
    {
        element:<LayoutAdmin/>,
        children:[
            {
                path: ADMIN_DASHBOARD_ROUTE,
                element:<Dashboard/>
            },
            {
                path: ADMIN_NOTIFICATIONS_ROUTE,
                element:<Messages/>
            },
            {
                path: ADMIN_ORDERS_ROUTE,
                element:<Orders/>
            },
            {
                path: ADMIN_USERS_ROUTE,
                element:<Agents/>
            },
            {
                path: ADMIN_SETTING_ROUTE,
                element:<Setting/>
            },
        ]
    },


    // agent pages
    {
        element:<LayoutAgent/>,
        children:[
            {
                path: AGENT_DASHBOARD_ROUTE,
                element:<Dashboard_Agent/>
            },
            {
                path: AGENT_NOTIFICATIONS_ROUTE,
                element:<Messages_Agent/>
            },
            {
                path: AGENT_ORDERS_ROUTE,
                element:<Orders_Agent/>
            },
            {
                path: AGENT_SETTING_ROUTE,
                element:<Setting_Agent/>
            },
        ]
    },



    ]
    , 
    {
        future: {
            v7_relativeSplatPath: true,          // Changes in relative route resolution within splat routes
            v7_fetcherPersist: true,             // Persistence behavior of fetchers
            v7_normalizeFormMethod: true,        // Normalizes formMethod casing to uppercase
            v7_partialHydration: true,           // Changes in RouterProvider hydration behavior
            v7_skipActionErrorRevalidation: true, // Changes revalidation after 4xx/5xx action responses
            v7_startTransition: true,           // Uses startTransition for state updates
    },
    }
)
