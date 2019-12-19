const axios = require("axios")
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://api.cogniac.io/1'

const create = (filepath = './image.jpg', options = {}) => {
  const {access_token} = options
  const url = `${baseUrl}/media`
  const fullPath = `${__dirname}/../../${filepath}`

  if(!filepath || !access_token) {
    throw new Error(`[ERROR] missing required para: ${filepath}, ${access_token}, ${tenantId}`)
  }

  const formData = new FormData()
  formData.append(path.basename(fullPath), fs.createReadStream(fullPath))
  const headers = {
    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
    "Authorization": `Bearer ${access_token}`,
  }
  return axios.create({headers}).post(url, formData)
}

const download = (mediaId, options = {}) => {
  const {access_token} = options
  const url = `${baseUrl}/media/download/${mediaId}/${mediaId}`
  
  if(!access_token) {
    throw new Error(`[ERROR] missing required para:, ${access_token}`)
  }

  const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${access_token}`,
  }
  
  return axios.get(
    url,
    {
      headers,
      responseType: 'arraybuffer'
    }
  )
}

const detections = ({mediaId, captureId}, _options) => {
  const {access_token} = _options
  if(!mediaId || !captureId || !access_token) {
    throw new Error(`[ERROR] missing required para: ${mediaId}, ${captureId}, ${tenantId}`)
  }

  const url = `${baseUrl}/media/${mediaId}/detections`
  const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${access_token}`,
  }
  
  return axios.get(
    url,
    {
      params: { wait_capture_id: captureId }, 
      headers
    }
  )
}

module.exports = { create, detections, download }