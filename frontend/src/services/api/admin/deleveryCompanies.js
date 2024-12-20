import axiosClient from "../axios";

const deleveryCompanies = {
    index : async () => {
        return await axiosClient.get(`/api/admin/delivery-companies`)
    }
}

export { deleveryCompanies };


// we call this code in user Context
