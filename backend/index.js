import path from 'path'
import express from 'express'
import fileUpload from 'express-fileupload'
import admin from './admin'
import sheet from './sheet'
import session from './session'
import content from './content'

// 影响到 Date 的 timezone
process.env.TZ = 'Asia/Shanghai'

let api = express()
  .use(express.json())
  .use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }))
  .use(admin)
  .use(sheet)
  .use(session)
  .use(content)

let index = express().use(express.Router().all('*', async (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '../dist/index.html'))
}))

export default {
  name: 'backend',
  configureServer(server) {
    server.middlewares
      .use('/api', api)

    // 如果是 replit 线上环境运行，则启用打包的版本（含 PWA）
    if (process.env['REPL_ID']) {
      server.middlewares
        .use('/sid', index)
        .use('/admin', index)
        .use('/', express.static('dist'))
    }
  }
}
