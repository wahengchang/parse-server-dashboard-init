const express = require('express')
const router = express.Router()

router.use(async (req, res) => {
    console.log('req.params: ', req.params)
    console.log('req.query: ', req.query)
    return res.send('ok')
})

module.exports = router