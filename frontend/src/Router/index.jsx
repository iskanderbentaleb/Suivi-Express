import {createBrowserRouter} from 'react-router-dom'
import Layout from '../Layouts/Layout'

import AuthenticationPage from '../Layouts/guest/pages/AuthenticationPage'
import Error404 from '../Layouts/pages_general/pages/Error404'


export const LOGIN_ROUTE = '/'
export const ADMIN_DASHBOARD_ROUTE = '/admin'
export const AGENT_DASHBOARD_ROUTE = '/agent'


export const router = createBrowserRouter([

    {
        // shared with all => users / guest
        element:<Layout/>,
        children:[
            {
                path:'*',
                element:<Error404/>
            },
        ]
    },


    {
        // shared with => guest
        element:<Layout/>,
        children:[
            {
                path: LOGIN_ROUTE,
                element:<AuthenticationPage/>
            },
        ],
    },



])
