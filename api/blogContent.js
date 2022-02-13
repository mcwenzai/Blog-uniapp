import { request } from '../utils/request.js'
import { appConfig } from '../config/config.js'

export function getBlogByUid (params) {
  return request.get(appConfig.WEB_API + '/content/getBlogByUid', params)  
}

export function praiseBlogByUid (params) {
  return request.get(appConfig.WEB_API + '/content/praiseBlogByUid', params)  
}

export function getSameBlogByBlogUid (params) {
  return request.get(appConfig.WEB_API + '/content/getSameBlogByBlogUid', params)  
}

export function postCommentList (params) {
  return request.post(appConfig.WEB_API + '/web/comment/getList', params)  
}