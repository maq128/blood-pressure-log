import express from 'express'
import db from './kvstore'

// 本模块不直接处理具体的请求，而是验证会话的有效性
const router = express.Router()

/**
 * 后续处理的请求都需要在一个有效的会话中才允许访问。
 */
router.all('*', async (req, res, next) => {
  // 拿到客户端的 sid
  let sid = req.header('x-sid')
  if (!sid) {
    res.status(401).json({
      errMsg: 'no auth'
    })
    return
  }

  // 验证 sid 的合法性
  let sheets = (await db.get('sheets')) || {}
  let sheetName = Object.keys(sheets).find(name => {
    return sheets[name]['sid'] === sid
  })
  if (!sheetName) {
    res.status(401).json({
      errMsg: 'invalid sid'
    })
    return
  }

  req._sheetName = sheetName
  next()
})

export default router
