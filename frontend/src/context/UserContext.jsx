import { createContext, useContext, useState } from 'react';
import { guestApi } from './../services/api/guest/guestApi';

// inisial values context
export const UserStateContext = createContext({
    DahboardOpend: false , // this for the admin , seller dashborad when screen is small so we can close it 
    setDahboardOpend : ()=>{},
    user: '' ,
    setUser : ()=>{},
    logout: ()=>{},
    login: ()=>{},
    setLanguage: ()=>{},
    authenticated: false ,
    setAuthenticated: ()=>{},
    setToken: ()=>{},
    setRefreshToken: ()=>{},
    setTokenSetTime: ()=>{},
});



export default function UserContext({children}){

    // tretment context values
    const [DahboardOpend, setDahboardOpend] = useState(false);
    const [user, setUser] = useState(undefined);
    const [authenticated, _setauthenticated] = useState('true' === window.localStorage.getItem('AUTH'));

    const setTokenSetTime = (time) => {
        window.localStorage.setItem('TokenSetTime' , time)
    }

    const setRefreshToken = (RefreshToken) => {
        window.localStorage.setItem('RefreshToken' , RefreshToken)
    }

    const setToken  = (Token) => {
        window.localStorage.setItem('Token' , Token)
    }

    const setAuthenticated = (isAuth) => {
        _setauthenticated(isAuth)
        window.localStorage.setItem('AUTH' , isAuth)
    }


    const login = async (email,password) => {
        await guestApi.getCsrfToken()
        return await guestApi.login(email,password)
    }


    const logout =  async () => {
        await guestApi.getCsrfToken()
        const response  = await guestApi.logout()
        setUser({})
        setAuthenticated(false)
        window.localStorage.removeItem('TokenSetTime') // remove local storage
        window.localStorage.removeItem('RefreshToken') // remove local storage
        window.localStorage.removeItem('AUTH') // remove local storage
        window.localStorage.removeItem('Token') // remove local storage
        window.localStorage.removeItem('role') // remove local storage
        return response ;
    }


    // this to save language of backend 
    // when u change the front language change the backend 
    const setLocale = (locale) => {
        localStorage.setItem('locale', locale);
    }


    // share context with All App
    return (
        <>
           <UserStateContext.Provider value={{DahboardOpend , setDahboardOpend , user, setUser , logout , login ,  authenticated , setAuthenticated , setToken , setRefreshToken , setTokenSetTime , setLocale}}>
                {children}
           </UserStateContext.Provider>
        </>
    )

}

// export to other component that we need
// => we use it like this : const { User , setUser } = useUserContext()  the we retrive data
export const useUserContext = () => useContext(UserStateContext); // it should be inside function

