import express from 'express'
import db from './kvstore'

// 本模块用于处理几个需要管理员密码的请求
const router = express.Router()

/**
 * 获取所有数据表的名字。
 */
router.get('/sheet/list', async (req, res) => {
  let { pwd } = req.query
  if (pwd !== process.env['ADMIN_PWD']) {
    res.status(403).json({
      errMsg: 'fail:no admin'
    })
    return
  }
  let sheets = (await db.get('sheets')) || {}
  let list = await sheets2list(sheets)
  res.json({
    errMsg: 'ok',
    data: list
  })
})

/**
 * 删除数据表。
 */
router.get('/sheet/remove', async (req, res) => {
  let { pwd, name } = req.query
  if (pwd !== process.env['ADMIN_PWD']) {
    res.status(403).json({
      errMsg: 'fail:no admin'
    })
    return
  }
  let sheets = (await db.get('sheets')) || {}
  delete sheets[name]
  await db.set('sheets', sheets)
  await db.delete(db.name2key(name))

  let list = await sheets2list(sheets)
  res.json({
    errMsg: 'ok',
    data: list
  })
})

/**
 * 备份数据库。
 */
router.get('/db/backup', async (req, res) => {
  let { pwd } = req.query
  if (pwd !== process.env['ADMIN_PWD']) {
    res.status(403).json({
      errMsg: 'fail:no admin'
    })
    return
  }

  res
    .type('json')
    .attachment(`blood-pressure-log.db.json`)
    .send(JSON.stringify(await db.getAll()))
})

/**
 * 恢复数据库。
 */
router.post('/db/restore', async (req, res) => {
  let { pwd } = req.query
  if (pwd !== process.env['ADMIN_PWD']) {
    res.status(403).json({
      errMsg: 'fail:no admin'
    })
    return
  }

  let all = JSON.parse(req.files.file.data.toString())
  await db.empty()
  await db.setAll(all)

  res.json({
    errMsg: 'ok'
  })
})

export default router

async function sheets2list(sheets) {
  let list = []
  for (let name of Object.keys(sheets).sort()) {
    let sheet = sheets[name]
    let content = (await db.get(db.name2key(name))) || []
    let num = content.length
    list.push({
      ...sheet,
      name,
      num,
    })
  }
  return list
}
