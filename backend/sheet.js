import express from 'express'
import ExcelJS from 'exceljs'
import db from './kvstore'

// 本模块用于处理几个无需进入会话的请求
const router = express.Router()

/**
 * 创建新的数据表，并开启会话。
 * 不可重名。
 */
router.get('/sheet/create', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd } = req.query
  if (!name || !pwd) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (sheets[name]) {
    res.status(403).json({
      errMsg: '数据表名称重复。'
    })
    return
  }

  let sid = genSid()
  let sheet = {
    pwd,
    sid
  }

  sheets[name] = sheet
  await db.set('sheets', sheets)

  res.json({
    errMsg: 'ok',
    data: { sid }
  })
})

/**
 * 以只读方式进入数据表的当前会话。
 */
router.get('/sheet/readonly', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd } = req.query
  if (!name || !pwd) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.status(403).json({
      errMsg: '数据表名称或口令错误。'
    })
    return
  }

  // 根据 sid 计算出对应的 roid
  let roid = db.sid2roid(sheets[name].sid)

  res.json({
    errMsg: 'ok',
    data: { roid }
  })
})

/**
 * 进入数据表的当前会话。
 */
router.get('/sheet/open', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd } = req.query
  if (!name || !pwd) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.status(403).json({
      errMsg: '数据表名称或口令错误。'
    })
    return
  }

  let sid = sheets[name].sid

  res.json({
    errMsg: 'ok',
    data: { sid }
  })
})

/**
 * 对一个数据表重新开启一个新的会话。
 * 同一时刻仅允许存在一个会话。
 */
router.get('/session/reset', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd } = req.query
  if (!name || !pwd) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.status(403).json({
      errMsg: '数据表名称或口令错误。'
    })
    return
  }

  let sid = genSid()
  let sheet = {
    ...sheets[name],
    sid
  }

  sheets[name] = sheet
  await db.set('sheets', sheets)

  res.json({
    errMsg: 'ok',
    data: { sid }
  })
})

/**
 * 导出指定的数据表。
 */
router.get('/sheet/export', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd, type } = req.query
  if (!name || !pwd) {
    res.type('txt').send('数据表名称和口令不能为空。')
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.type('txt').send('数据表名称或口令错误。')
    return
  }
  let content = (await db.get(db.name2key(name))) || []
  content.sort((a, b) => b.ts - a.ts) // 倒序
  switch (type) {
    case 'xls':
      res
        .type('xls')
        .attachment(`${name}.xlsx`)
        .send(await buildXls(content))
      return

    case 'csv':
      res
        .type('csv')
        .attachment(`${name}.csv`)
        .send(buildCsv(content))
      return

    case 'json':
      res
        .type('json')
        .attachment(`${name}.json`)
        .send(JSON.stringify(content, null, '  '))
      return
  }
  res.type('txt').send('错误请求。')
})

/**
 * 修改数据表名称。
 */
router.get('/sheet/changename', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd, newname } = req.query
  if (!name || !pwd || !newname) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.status(403).json({
      errMsg: '数据表名称或口令错误。'
    })
    return
  }
  if (sheets[newname]) {
    res.status(403).json({
      errMsg: '数据表名称重复。'
    })
    return
  }

  sheets[newname] = sheets[name]
  delete sheets[name]
  await db.set('sheets', sheets)

  let content = (await db.get(db.name2key(name))) || []
  await db.set(db.name2key(newname), content)
  await db.delete(db.name2key(name))

  res.json({
    errMsg: 'ok'
  })
})

/**
 * 修改数据表口令。
 */
router.get('/sheet/changepwd', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { name, pwd, newpwd } = req.query
  if (!name || !pwd || !newpwd) {
    res.status(403).json({
      errMsg: '数据表名称和口令不能为空。'
    })
    return
  }
  if (!sheets[name] || sheets[name]['pwd'] !== pwd) {
    res.status(403).json({
      errMsg: '数据表名称或口令错误。'
    })
    return
  }

  sheets[name].pwd = newpwd
  await db.set('sheets', sheets)

  res.json({
    errMsg: 'ok'
  })
})

/**
 * 加载数据表的内容。
 * 支持以 sid 或 roid 来指定数据表。
 */
router.get('/sheet/load', async (req, res) => {
  let sheets = (await db.get('sheets')) || {}
  let { sid, roid } = req.query

  let name = Object.keys(sheets).find(name => {
    if (sheets[name]['sid'] === sid) return true
    if (db.sid2roid(sheets[name]['sid']) === roid) return true
    return false
  })
  if (!name) {
    res.status(401).json({
      errMsg: 'invalid sid/roid'
    })
    return
  }

  let content = (await db.get(db.name2key(name))) || []
  let data = { name, content }
  if (!roid) {
    // 仅在非只读方式打开时才返回敏感信息
    data = {
      name,
      content,
      ...sheets[name],
    }
  }
  res.json({
    errMsg: 'ok',
    data
  })
})

export default router

function genSid() {
  let sid = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    sid += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return sid
}

function buildCsv(content) {
  let lines = [[
    'timestamp',
    'systolic pressure',
    'diastolic pressure',
    'heart rate',
    'irregular pulse',
    'time'
  ].join(',')]
  for (let log of content) {
    let line = [
      log.ts,
      log.sp,
      log.dp,
      log.hr,
      log.ip ? '+' : '',
      new Date(log.ts).toLocaleString()
    ]
    lines.push(line.join(','))
  }
  return lines.join('\n')
}

async function buildXls(content) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'blood-pressure-log'
  workbook.created = new Date()

  // 找出所有有记录的月份
  let map = {}
  for (let log of content) {
    let t = new Date(log.ts)
    let y = t.getFullYear()
    let m = t.getMonth()
    map[`${y}.${m}`] = { y, m }
  }
  let yms = Object.values(map).sort((a, b) => (b.y * 12 + b.m) - (a.y * 12 + a.m)) // 倒序

  // 如果没有任何记录则添加一个“本月”
  if (yms.length == 0) {
    yms.push({
      y: new Date().getFullYear(),
      m: new Date().getMonth(),
    })
  }

  // 每个月一个 worksheet
  for (let { y, m } of yms) {
    const worksheet = workbook.addWorksheet(`${y}.${m + 1}`)
    let row = worksheet.addRow(['日期', '午前', '', '', '', '', '午后', '', '', '', ''])
    for (let col = 1; col <= 11; col++) {
      row.getCell(col).alignment = { vertical: 'middle', horizontal: 'center' }
    }
    row.getCell(2).numFmt = 'hh:mm'
    row.getCell(7).numFmt = 'hh:mm'
    worksheet.addRow(['', '时间', '高压', '低压', '心率', '不规则脉波', '时间', '高压', '低压', '心率', '不规则脉波'], 'i')
    worksheet.mergeCells('A1:A2')
    worksheet.mergeCells('B1:F1')
    worksheet.mergeCells('G1:K1')

    // 过滤出当月的所有记录
    let mLogs = content.filter(log => {
      let t = new Date(log.ts)
      return t.getFullYear() == y && t.getMonth() == m
    }).sort((a, b) => a.ts - b.ts) // 正序

    // 逐日添加
    for (let idx of Array(new Date(y, m + 1, 0).getDate()).keys()) {
      let date = idx + 1

      // 过滤出当天的记录
      let dLogs = mLogs.filter(log => new Date(log.ts).getDate() == date)

      // 当天无记录则添加一个空行
      if (dLogs.length == 0) {
        worksheet.addRow([ date, '', '', '', '', '', '', '', '', '', ''], 'i')
        continue
      }

      // 逐行添加
      for (let log of dLogs) {
        let t = new Date(log.ts)

        // NOTE: exceljs 对于给定的 Date 值总是把单元格的内容设置为 timestamp 对应的 UTC 时间，
        // 所以这里只好做个校正。（此法要求已经通过 process.env.TZ 设置了正确的时区）
        let correctTs = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds())
        let data = [
          new Date(correctTs),
          log.sp,
          log.dp,
          log.hr,
          log.ip ? '+' : ''
        ]

        if (t.getHours() < 12) {
          data = [date, ...data, '', '', '', '', '']
        } else {
          data = [date, '', '', '', '', '', ...data]
        }
        worksheet.addRow(data, 'i')
      }
    }

    // 日期列合并相同日期的单元格
    let A = worksheet.getColumn(1)
    let fromRowNum = 3
    let fromV = ''
    for (let rowNum = 3; rowNum < A.values.length; rowNum++) {
      if (A.values[rowNum] === fromV) continue
      if (fromRowNum < rowNum - 1) {
        worksheet.mergeCells(`A${fromRowNum}:A${rowNum - 1}`)
      }
      fromRowNum = rowNum
      fromV = A.values[rowNum]
    }
  }

  // workbook.xlsx.writeFile('test.xlsx')
  return workbook.xlsx.writeBuffer()
}
