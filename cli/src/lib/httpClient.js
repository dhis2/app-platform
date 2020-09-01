const axios = require('axios').default

module.exports.createClient = ({ baseUrl, auth, ...options }) => {
    return axios.create({
        baseURL: baseUrl,
        timeout: 30000,
        auth: auth,
        ...options,
    })
}
