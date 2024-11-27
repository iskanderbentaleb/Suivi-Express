import {createBrowserRouter} from 'react-router-dom'
import Layout from '../Layouts/guest/Layout'
import LayoutAdmin from '../Layouts/admin/Layout'

import AuthenticationPage from '../Layouts/guest/pages/AuthenticationPage'
import ForgotPasswordPage from '../Layouts/guest/pages/ForgotPasswordPage'
import ResetPasswordPage from '../Layouts/guest/pages/ResetPasswordPage'

import Error404 from '../Layouts/pages_general/pages/Error404'
import Dashboard from '../Layouts/admin/pages/Dashboard'
import Notifications from '../Layouts/admin/pages/Notifications'
import Orders from '../Layouts/admin/pages/Orders'
import Setting from '../Layouts/admin/pages/Setting'
import Agents from '../Layouts/admin/pages/Agents'



export const LOGIN_ROUTE = '/'
export const FORGOT_PASSWORD_ROUTE = '/forgot-password'
export const RESET_PASSWORD_ROUTE = '/password-reset'


export const ADMIN_ROUTE = '/admin'
export const ADMIN_DASHBOARD_ROUTE = ADMIN_ROUTE + '/dashboard'
export const ADMIN_NOTIFICATIONS_ROUTE = ADMIN_ROUTE + '/notifications/'
export const ADMIN_ORDERS_ROUTE = ADMIN_ROUTE + '/orders/'
export const ADMIN_USERS_ROUTE = ADMIN_ROUTE + '/users/'
export const ADMIN_SETTING_ROUTE = ADMIN_ROUTE + '/setting/'



export const AGENT_DASHBOARD_ROUTE = '/agent'


export const router = createBrowserRouter(
    [

    // shared with all => shared with guest Layouts
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


    // shared Admin layout pages
    {
        element:<LayoutAdmin/>,
        children:[
            {
                path: ADMIN_DASHBOARD_ROUTE,
                element:<Dashboard/>
            },
            {
                path: ADMIN_NOTIFICATIONS_ROUTE,
                element:<Notifications/>
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



    ]
    , 
    {
        future: {
            v7_relativeSplatPath: true,          // Changes in relative route resolution within splat routes
            v7_fetcherPersist: true,             // Persistence behavior of fetchers
            v7_normalizeFormMethod: true,        // Normalizes formMethod casing to uppercase
            v7_partialHydration: true,           // Changes in RouterProvider hydration behavior
            v7_skipActionErrorRevalidation: true, // Changes revalidation after 4xx/5xx action responses
            v7_startTransition: false,           // Uses startTransition for state updates
    },
    }
)
