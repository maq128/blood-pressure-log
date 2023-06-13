import Db from '@replit/database'
import fs from 'fs'
import crypto from 'crypto'

function name2key(name) {
  return `sheet:${name}`
}

function sid2roid(sid) {
  const md5 = crypto.createHash('md5')
  return md5.update(sid).digest('hex')
}

let db
if (process.env['REPL_ID']) {
  // 在 replit 线上环境
  db = new Db()
  db.name2key = name2key
  db.sid2roid = sid2roid
} else {
  // 在其它开发环境
  let filename = './data/mock-replit-database.json'
  async function loadDataFromDisk() {
    return await fs.promises.readFile(filename)
      .then(buffer => {
        return JSON.parse(buffer.toString())
      })
      .catch(() => {
        return {}
      })
  }

  db = {}

  db.name2key = name2key
  db.sid2roid = sid2roid

  db.set = async (k, v) => {
    let data = await loadDataFromDisk()
    data[k] = v
    await fs.promises.writeFile(filename, JSON.stringify(data, null, '  '))
  }

  db.get = async (k) => {
    let data = await loadDataFromDisk()
    return data[k]
  }

  db.delete = async (k) => {
    let data = await loadDataFromDisk()
    delete data[k]
    await fs.promises.writeFile(filename, JSON.stringify(data, null, '  '))
  }

  db.empty = async () => {
    await fs.promises.writeFile(filename, '{}')
  }

  db.getAll = async () => {
    let data = await loadDataFromDisk()
    return data
  }

  db.setAll = async (all) => {
    await fs.promises.writeFile(filename, JSON.stringify(all, null, '  '))
  }
}

export default db
