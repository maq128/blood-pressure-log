import express from 'express'
import db from './kvstore'

// 本模块用于处理针对当前会话的数据表的操作
const router = express.Router()

router.post('/sheet/save', async (req, res) => {
  let name = req._sheetName
  let content = req.body
  await db.set(db.name2key(name), content)
  res.json({
    errMsg: 'ok'
  })
})

router.post('/log/create', async (req, res) => {
  let name = req._sheetName
  let log = req.body
  let content = (await db.get(db.name2key(name))) || []
  content.unshift(log)
  await db.set(db.name2key(name), content)
  res.json({
    errMsg: 'ok'
  })
})

router.post('/log/update', async (req, res) => {
  let name = req._sheetName
  let log = req.body
  let content = (await db.get(db.name2key(name))) || []
  content = content.map(v => v.ts == log.ts ? log : v)
  await db.set(db.name2key(name), content)
  res.json({
    errMsg: 'ok'
  })
})

router.post('/log/remove', async (req, res) => {
  let name = req._sheetName
  let log = req.body
  let content = (await db.get(db.name2key(name))) || []
  content = content.filter(v => v.ts != log.ts)
  await db.set(db.name2key(name), content)
  res.json({
    errMsg: 'ok'
  })
})

export default router
