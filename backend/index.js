import express from 'express'
import fileUpload from 'express-fileupload'
import admin from './admin'
import sheet from './sheet'
import session from './session'
import content from './content'

// 影响到 Date 的 timezone
process.env.TZ = 'Asia/Shanghai'

let app = express()
  .use(express.json())
  .use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
  .use(admin)
  .use(sheet)
  .use(session)
  .use(content)

export default {
  name: 'backend',
  configureServer(server) {
    server.middlewares.use('/api', app)
  }
}
