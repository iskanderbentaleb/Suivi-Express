import axiosClient from "../axios";

const dashboard = {
    index : async () => {
        return await axiosClient.get(`/api/agent/dashboard`)
    },
    getOrdersByYear : async (payload) => {
        return await axiosClient.post(`/api/agent/dashboard` , payload);
    },
    getMinYear : async () => {
        return await axiosClient.get(`/api/agent/dashboard/getMinYear`)
    },
}

export { dashboard };


// we call this code in user Context
