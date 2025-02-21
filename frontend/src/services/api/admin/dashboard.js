import axiosClient from "../axios";

const dashboard = {
    index : async () => {
        return await axiosClient.get(`/api/admin/dashboard`)
    },
    getOrdersByYear : async (payload) => {
        return await axiosClient.post(`/api/admin/dashboard` , payload);
    },
    getMinYear : async () => {
        return await axiosClient.get(`/api/admin/dashboard/getMinYear`)
    },
}

export { dashboard };


// we call this code in user Context
