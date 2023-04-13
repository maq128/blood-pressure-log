import axios from 'axios'

let client = axios.create()

function init(sid) {
  client = axios.create({
    headers: {
      'x-sid': sid
    }
  })
}

async function sheetList(adminPwd) {
  return client.get('/api/sheet/list', {
    params: { pwd: adminPwd }
  }).then(result => result.data)
}

async function sheetRemove(adminPwd, name) {
  return client.get('/api/sheet/remove', {
    params: { pwd: adminPwd, name }
  }).then(result => result.data)
}

function dbBackup(adminPwd) {
  window.open(`/api/db/backup?pwd=${adminPwd}`, '_blank')
}

async function dbRestore(adminPwd, file) {
  let formData = new FormData();
  formData.append('file', file);
  return client.post(`/api/db/restore?pwd=${adminPwd}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  })
}

async function sheetCreate(name, pwd) {
  return client.get('/api/sheet/create', {
    params: { name, pwd }
  }).then(result => {
    return result.data
  })
}

async function sheetOpenReadonly(name, pwd) {
  return client.get('/api/sheet/readonly', {
    params: { name, pwd }
  }).then(result => {
    return result.data
  })
}

async function sheetOpen(name, pwd) {
  return client.get('/api/sheet/open', {
    params: { name, pwd }
  }).then(result => {
    return result.data
  })
}

async function sessionReset(name, pwd) {
  return client.get('/api/session/reset', {
    params: { name, pwd }
  }).then(result => {
    return result.data
  })
}

function sheetExport(name, pwd, type) {
  window.open(`/api/sheet/export?name=${name}&pwd=${pwd}&type=${type}`, '_blank')
}

async function sheetChangeName(name, pwd, newname) {
  return client.get('/api/sheet/changename', {
    params: { name, pwd, newname }
  }).then(result => {
    return result.data
  })
}

async function sheetChangePwd(name, pwd, newpwd) {
  return client.get('/api/sheet/changepwd', {
    params: { name, pwd, newpwd }
  }).then(result => {
    return result.data
  })
}

async function sheetLoad(params) {
  let qs = new URLSearchParams(params).toString()
  return client.get(`/api/sheet/load?${qs}`).then(result => result.data)
}

async function sheetSave(content) {
  return client.post('/api/sheet/save', content).then(result => result.data)
}

async function logCreate(log) {
  return client.post('/api/log/create', log).then(result => result.data)
}

async function logUpdate(log) {
  return client.post('/api/log/update', log).then(result => result.data)
}

async function logRemove(log) {
  return client.post('/api/log/remove', log).then(result => result.data)
}

export default {
  init,

  // admin
  sheetList,
  sheetRemove,
  dbBackup,
  dbRestore,

  // sheet
  sheetCreate,
  sheetOpenReadonly,
  sheetOpen,
  sessionReset,
  sheetExport,
  sheetChangeName,
  sheetChangePwd,
  sheetLoad,

  // content
  sheetSave,
  logCreate,
  logUpdate,
  logRemove,
}
