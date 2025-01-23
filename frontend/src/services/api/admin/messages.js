import axiosClient from "../axios";

const messages = {
    inbox : async (page , search = '') => {
        return await axiosClient.get(`/api/admin/mails?page=${page}&search=${search}`)
    },
    // exportAgent : async () => {
    //     return await axiosClient.get(`/api/admin/agents/export`, {responseType: 'blob'})
    // },
    // post : async (payload) => {
    //     return await axiosClient.post(`/api/admin/agents` , payload);
    // },
    // update: async (id , payload) => {
    //     // here we should add ?_method=PUT and make request method post , 
    //     return await axiosClient.post(`/api/admin/agents/${id}?_method=PUT`, payload );
    // },
    // delete : async (id) => {
    //     return await axiosClient.delete(`/api/admin/agents/${id}`)
    // },
}

export { messages };


// we call this code in user Context
