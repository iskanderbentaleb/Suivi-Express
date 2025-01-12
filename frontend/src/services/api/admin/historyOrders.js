import axiosClient from "../axios";

const historyOrders = {
    post : async (payload) => {
        return await axiosClient.post(`/api/admin/HistoryOrders` , payload);
    },
    update_history_validator: async (id) => {
        return await axiosClient.post(`api/admin/HistoryOrders/${id}?_method=PUT`);
    },
}

export { historyOrders } ;


// we call this code in user Context
