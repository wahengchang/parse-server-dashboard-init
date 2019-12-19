const axios = require("axios")
const baseUrl = 'https://api.cogniac.io/1'

const login = async ({tenantId, username, password}) => {
    const auth = {username,password}

    if(!tenantId || !username || !password) {
        throw new Error(`[ERROR] missing required para: ${username}, ${password}, ${tenantId}`)
    }

    const url = `${baseUrl}/token?tenant_id=${tenantId}`
    const res = await axios.get(url,{auth})

    console.log('[INFO] login success')
    return res.data
}

module.exports = {login}