const axios = require('axios').default

module.exports.createClient = ({ baseUrl, auth, ...options }) => {
    return axios.create({
        baseURL: baseUrl,
        auth: auth,
        ...options,
    })
}
