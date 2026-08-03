import { http, unwrap } from './request'
import type { UploadResult } from '@/types/api'

/**
 * 上传单个文件到 OSS（后端走 QiNiuOssUtil），返回可访问的图片 URL
 */
export function uploadFile(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return unwrap<UploadResult>(
    http.post('/common/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }),
  )
}