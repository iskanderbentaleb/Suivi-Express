import axiosClient from "../axios";

const agents = {
    index : async (page , search = '', sort = 'name' , direction = 'asc') => {
        return await axiosClient.get(`/api/admin/agents?page=${page}&search=${search}&sort=${sort}&direction=${direction}`)
    },
}

export { agents };


// we call this code in user Context
