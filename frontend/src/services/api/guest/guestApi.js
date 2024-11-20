// we call this code in user Context

import axiosClient from "../axios";

const guestApi = {
    getCsrfToken: async () => {
        // fetch the CSRF token
        return await axiosClient.get('/sanctum/csrf-cookie');
    },
    refreshToken: async (refreshToken , expiredToken) => {
        // regerate token every 30 min 
        return await axiosClient.post('/refresh-token' , {refresh_token : refreshToken , expired_token : expiredToken} );
    },
    login: async (email, password) => {
        // send request to get session and put in the browser
        return await axiosClient.post('/login', {email, password});
    },
    logout: async () => {
        // send request to get destroy session
        return await axiosClient.post('/logout');
    },
    getUser: async (path) => {
        // get user information
        return await axiosClient.get(`/api/${path}/`)
    },
}

export { guestApi };


// we call this code in user Context
