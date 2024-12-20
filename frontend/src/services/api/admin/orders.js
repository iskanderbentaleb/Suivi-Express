import axiosClient from "../axios";

const orders = {
    index : async (page , search = '') => {
        return await axiosClient.get(`/api/admin/orders?page=${page}&search=${search}`)
    },
    post : async (payload) => {
        return await axiosClient.post(`/api/admin/orders/` , payload);
    },
    update: async (id , payload) => {
        return await axiosClient.post(`/api/admin/orders/${id}?_method=PUT`, payload );
    },
    updateStausOrder: async (id , payload) => {
        return await axiosClient.post(`api/admin/orders/${id}/status?_method=PUT`, payload );
    },
    delete : async (id) => {
        return await axiosClient.delete(`/api/admin/orders/${id}`)
    },
}

export { orders };


// we call this code in user Context
