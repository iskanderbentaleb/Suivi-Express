import axiosClient from "../axios";

const agents = {
    index : async (page , search = '', sort = 'name' , direction = 'desc') => {
        return await axiosClient.get(`/api/admin/agents?page=${page}&search=${search}&sort=${sort}&direction=${direction}`)
    },
    post : async (payload) => {
        return await axiosClient.post(`/api/admin/agents` , payload);
    },
    update: async (id , payload) => {
        // here we should add ?_method=PUT and make request method post , 
        return await axiosClient.post(`/api/admin/agents/${id}?_method=PUT`, payload );
    },
    delete : async (id) => {
        return await axiosClient.delete(`/api/admin/agents/${id}`)
    },
}

export { agents };


// we call this code in user Context
