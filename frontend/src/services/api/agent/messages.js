import axiosClient from "../axios";

const messages = {
    inbox : async (page , search = '' , isRead = "all" , typeMessage = "receive") => {
        return await axiosClient.get(`/api/agent/mails?page=${page}&search=${search}&is_read=${isRead}&typeMessage=${typeMessage}`)
    },
    selectedOrderMessagesInbox : async (order_id) => {
        return await axiosClient.get(`/api/agent/mails/${order_id}`)
    },
    sendMessage : async (payload) => {
        return await axiosClient.post(`/api/agent/mails/sent-message` , payload);
    },
}

export { messages };


// we call this code in user Context
