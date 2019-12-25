const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const cogApis = require('../lib/cogniac')
const { createCanvas, loadImage } = require('canvas')

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(bodyParser.raw())

const bufferToParseFile = (buffer, {title, format}) => {
    const base64 = buffer.toString('base64');
    const parseFile = new Parse.File(`${title}.${format}`, { base64: base64 },format)
    return parseFile
}

const downloadMediaAsParseFile = async (media, bestDetection = {}, {tenant,username,password}) => {
    const {media_format, media_id} = media
    const {access_token} = await cogApis.auth.login({tenantId:tenant, username, password})
    const mediaRes = await cogApis.media.download(media_id,{access_token})
    const parseFileOrigin = bufferToParseFile(mediaRes.data, {
        title: `${media_id}.${media_format}`,
        format: media_format
    })

    const {app_data} = bestDetection
    const canvas = createCanvas(media.image_width, media.image_height)
    const ctx = canvas.getContext('2d')
    const img = await loadImage(mediaRes.data)
    ctx.drawImage(img, 0, 0)
    ctx.strokeStyle = 'lightgreen';
    for(const item of app_data) {
        const {box} = item
        ctx.strokeRect(
            box.x0,box.y0,
            box.x1 - box.x0,box.y1- box.y0
        );
    }
    const parseFileDraw = bufferToParseFile(canvas.toBuffer(), {
        title: `${media_id}-draw.${media_format}`,
        format: media_format
    })

    // jIns.write('lena-small-bw.jpg')
    return {parseFileOrigin, parseFileDraw}
}

const createDetectionObj = async (title, mediaObj = {}, bestDetection = {}, parseFile, parseFileDraw, targetCogConfig) => {
    const CogDetection = Parse.Object.extend("CogDetection");
    const cm = new CogDetection();
    cm.set("title", title);
    cm.set("metaMedia", mediaObj);
    cm.set("metaDetection", bestDetection);
    cm.set("sourceId", mediaObj.media_id)
    cm.set("file", parseFile)
    cm.set("fileDraw", parseFileDraw)
    cm.set("cogConfig", targetCogConfig)
    const cdetection = await cm.save()

    console.log('[INFO] going to add relation CogConfig')
    targetCogConfig.relation("cogDetections").add(cdetection); // Post is a Parse Object
    await targetCogConfig.save(null,{ useMasterKey: true });
    console.log('[INFO] saved CogConfig relation ...')
    
    return cdetection
}
const fetchCogConfig = (id) => {
    var CogConfig = Parse.Object.extend("CogConfig");
    var cc = new Parse.Query(CogConfig);
    cc.include("cogAccount");
    return cc.get(id,{useMasterKey:true})
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
        const bestResult = detectionList.sort((pre, post)=>{
            return post.probability - pre.probability
        })[0]
    

        const title = `project-${new Date().getTime()}`
        const sourceId = media.media_id
        
        // 1- init cogAccount and cogConfig
        const resCogConfig = await fetchCogConfig(targetCogConfigId)
        const {title: cogConfigTitle, cogAccount} = resCogConfig.toJSON()
        const {title: cogAccountTitle,username,password,tenant, } = cogAccount
        console.log('[INFO] CogConfig object is fetched: ',targetCogConfigId, cogConfigTitle )
        console.log('[INFO] CogAccount object is fetched: ', cogAccountTitle )

        // 2- download media from detection
        const {parseFileOrigin, parseFileDraw} = await downloadMediaAsParseFile(media, bestResult, {tenant, username, password})
        console.log('[INFO] media is uploaded')

        // 3- create media object
        const resDetection = await createDetectionObj(cogAccountTitle, media, bestResult, parseFileOrigin, parseFileDraw, resCogConfig)
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