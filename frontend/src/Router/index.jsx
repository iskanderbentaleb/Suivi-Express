import {createBrowserRouter} from 'react-router-dom'
import Layout from '../Layouts/guest/Layout'
import LayoutAdmin from '../Layouts/admin/Layout'

import AuthenticationPage from '../Layouts/guest/pages/AuthenticationPage'
import Error404 from '../Layouts/pages_general/pages/Error404'
import Dashboard from '../Layouts/admin/pages/Dashboard'


export const LOGIN_ROUTE = '/'


export const ADMIN_DASHBOARD_ROUTE = '/admin'



export const AGENT_DASHBOARD_ROUTE = '/agent'


export const router = createBrowserRouter([

    // shared with all => shared with guest Layouts
    {
        element:<Layout/>,
        children:[
            {
                path:'*',
                element:<Error404/>
            },
            {
                path: LOGIN_ROUTE,
                element:<AuthenticationPage/>
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
        ]
    },




])
