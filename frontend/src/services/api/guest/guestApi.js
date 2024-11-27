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
        return await axiosClient.post('/login', {email, password});
    },
    forgot_password: async (email) => {
        return await axiosClient.post('/forgot-password', {email});
    },
    reset_password: async (token , email , password , password_confirmation) => {
        return await axiosClient.post('/reset-password', {token , email , password , password_confirmation});
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
