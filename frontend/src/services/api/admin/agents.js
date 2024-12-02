import axiosClient from "../axios";

const agents = {
    index : async (page , search = '', sort = 'name' , direction = 'desc') => {
        return await axiosClient.get(`/api/admin/agents?page=${page}&search=${search}&sort=${sort}&direction=${direction}`)
    },
    delete : async (id) => {
        return await axiosClient.delete(`/api/admin/agents/${id}`)
    },
}

export { agents };


// we call this code in user Context
