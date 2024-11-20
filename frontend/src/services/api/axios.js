import axios from 'axios'

const axiosClient = axios.create({
    baseURL : import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    withXSRFToken: true
})


// before send Request  do this : add token
axiosClient.interceptors.request.use(
    (config) => {

      // Add authorization token to headers
      const token = localStorage.getItem('Token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;

    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
  );




export default axiosClient ;
