import axiosClient from "../axios";

const statusOrders = {
    index : async () => {
        return await axiosClient.get(`/api/admin/status-orders`)
    }
}

export { statusOrders } ;


// we call this code in user Context
