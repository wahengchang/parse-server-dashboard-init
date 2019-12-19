const axios = require("axios")
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://api.cogniac.io/1'

const associateMedia = ({mediaId, subjectId}, _options = {}) => {
  if(!mediaId || !subjectId) {
    throw new Error(`[ERROR] missing required para: ${mediaId}, ${subjectId}, ${tenantId}`)
  }

  const {access_token} = _options
  const url = `${baseUrl}/subjects/${subjectId}/media`
  const headers = {
    'Content-Type': `application/json`,
    "Authorization": `Bearer ${access_token}`,
  }
  const options = {
    "media_id": mediaId,
    "force_feedback":true,
    "enable_wait_result": true
    }
  return axios.create({headers}).post(url, options)
}

module.exports = { associateMedia }