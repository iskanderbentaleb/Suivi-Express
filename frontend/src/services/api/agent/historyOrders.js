import axiosClient from "../axios";

const historyOrders = {
    post : async (payload) => {
        return await axiosClient.post(`/api/agent/HistoryOrders` , payload);
    },
}

export { historyOrders } ;


// we call this code in user Context
