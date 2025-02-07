import axiosClient from "../axios";

const messages = {
    inbox : async (page , search = '' , isRead = "all") => {
        return await axiosClient.get(`/api/admin/mails?page=${page}&search=${search}&is_read=${isRead}`)
    },
    selectedOrderMessagesInbox : async (order_id) => {
        return await axiosClient.get(`/api/admin/mails/${order_id}`)
    },
    sendMessage : async (payload) => {
        return await axiosClient.post(`/api/admin/mails/sent-message` , payload);
    },

    // exportAgent : async () => {
    //     return await axiosClient.get(`/api/admin/agents/export`, {responseType: 'blob'})
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
