import axiosClient from "../axios";

const orders = {
    index : async (page , search = '') => {
        return await axiosClient.get(`/api/agent/orders?page=${page}&search=${search}`)
    },
    tasktoday : async (page, search = '') => {
        return await axiosClient.get(`/api/agent/orders/todaytask?page=${page}&search=${search}`)
    },
    order_history : async (order_id) => {
        return await axiosClient.get(`/api/agent/orders/${order_id}/history`)
    },
    exportOrders : async () => {
        return await axiosClient.get(`/api/agent/orders/export`, {responseType: 'blob'})
    },
    update: async (id , payload) => {
        return await axiosClient.post(`/api/agent/orders/${id}?_method=PUT`, payload );
    },
    updateStausOrder: async (id , payload) => {
        return await axiosClient.post(`api/agent/orders/${id}/status?_method=PUT`, payload );
    },
}

export { orders };


// we call this code in user Context
