const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const cogApis = require('../lib/cogniac')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(bodyParser.raw())

// const getCogAccount = async (id) => {
//     var CogAccount = Parse.Object.extend("CogAccount");
//     var cc = new Parse.Query(CogAccount);
//     return cc.get(id)
// }

const downloadMediaAsParseFile = async (media, {tenant,username,password}) => {
    const {media_format, media_id} = media
    const {access_token} = await cogApis.auth.login({tenantId:tenant, username, password})
    const mediaRes = await cogApis.media.download(media_id,{access_token})
    const base64 = mediaRes.data.toString('base64');
    const parseFile = new Parse.File(`${media_id}.${media_format}`, { base64: base64 },media_format)
    return parseFile
}

const createDetectionObj = (title, mediaObj = {}, bestDetection = {}, parseFile) => {
    const CogDetection = Parse.Object.extend("CogDetection");
    const cm = new CogDetection();
    cm.set("title", title);
    cm.set("metaMedia", mediaObj);
    cm.set("metaDetection", bestDetection);
    cm.set("sourceId", mediaObj.media_id)
    cm.set("file", parseFile)
    return  cm.save()
}
const fetchCogConfig = (id) => {
    var CogConfig = Parse.Object.extend("CogConfig");
    var cc = new Parse.Query(CogConfig);
    cc.include("cogAccount");
    return cc.get(id,{useMasterKey:true})
}

const fetchCogAccount = (id) => {
    var CogAccount = Parse.Object.extend("CogAccount");
    var cc = new Parse.Query(CogAccount);
    return cc.get(id,{useMasterKey:true})
}

const fetchCogConfigOfAccount = (account) => {
    const CogConfig = Parse.Object.extend("CogConfig");
    const _query = new Parse.Query(CogConfig);
    _query.equalTo("cogAccount", account);
    return _query.find({useMasterKey: true});
}

router.use(async (req, res) => {
    try {

        console.log('req.params: ', req.params)
        console.log('req.query: ', req.query)
        const {body: _body, query = {}} = req
        const {cogConfig: targetCogConfigId = ''} = query
        const body = typeof _body === 'string'? JSON.parse(_body) : _body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const headers = req.headers
        const host = req.get('host');
        const origin = req.get('origin');
    
        const {media, subjects: detectionList} = body

        const title = `project-${new Date().getTime()}`
        const sourceId = media.media_id
        
        // 1- init cogAccount and cogConfig
        const resCc = await fetchCogConfig(targetCogConfigId)
        const {title: cogConfigTitle, cogAccount} = resCc.toJSON()
        const {title: cogAccountTitle,username,password,tenant, } = cogAccount
        console.log('[INFO] CogConfig object is fetched: ',targetCogConfigId, cogConfigTitle )
        console.log('[INFO] CogAccount object is fetched: ', cogAccountTitle )

        // 2- download media from detection
        const parseFile = await downloadMediaAsParseFile(media, {tenant, username, password})
        console.log('[INFO] media is uploaded')

        // 3- create media object
        const bestResult = detectionList.sort((pre, post)=>{
            return post.probability - pre.probability
        })[0]
        const resDetection = await createDetectionObj(cogAccountTitle, media, bestResult, parseFile)
        console.log('[INFO] detection object is created', resDetection)
        return res.send('ok')
    }
    catch(e){
        console.log('[ERROR] ',e)
        res.status(500)
        return res.json(e)
    }
})

module.exports = router