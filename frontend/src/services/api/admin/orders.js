import axiosClient from "../axios";

const orders = {
    index : async (page , search = '') => {
        return await axiosClient.get(`/api/admin/orders?page=${page}&search=${search}`)
    },
    tasktoday : async (page, search = '') => {
        return await axiosClient.get(`/api/admin/orders/todaytask?page=${page}&search=${search}`)
    },
    order_history : async (order_id) => {
        return await axiosClient.get(`/api/admin/orders/${order_id}/history`)
    },
    exportOrders : async () => {
        return await axiosClient.get(`/api/admin/orders/export`, {responseType: 'blob'})
    },
    exportOrdersTemplate : async () => {
        return await axiosClient.get(`api/admin/orders/download-template`, {responseType: 'blob'})
    },
    importOrders: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosClient.post(`/api/admin/orders/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    },
    post : async (payload) => {
        return await axiosClient.post(`/api/admin/orders/` , payload);
    },
    update: async (id , payload) => {
        return await axiosClient.post(`/api/admin/orders/${id}?_method=PUT`, payload );
    },
    updateArchive: async (id , payload) => {
        return await axiosClient.post(`api/admin/orders/${id}/archive?_method=PUT`, payload );
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
