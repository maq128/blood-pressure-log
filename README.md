# 项目说明

血压记录，用 Vue3 + Vite 实现，目标部署平台是 replit.com。
如果在非 Replit 环境部署，则数据库存储退化为 .json 文件存储。

Vite 除了对前端代码进行打包之外，还可以启动一个 server，本意是开发调试时作为后端反向代理来使用，
本项目直接用这个 server 来运行后端代码。

# TODOs

- 使用 Service Worker 进行前端缓存

# 参考资料

[Node.js http](https://nodejs.org/api/http.html)

[Express 框架开发](https://juejin.cn/post/6844904023380721678)

[replit database](https://github.com/replit/database-node)

[Vant](https://vant-contrib.gitee.io/vant/)

[exceljs](https://github.com/exceljs/exceljs)

[vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/)

[指针事件](https://zh.javascript.info/pointer-events)

[一篇搞定 JavaScript 时区问题](https://zhuanlan.zhihu.com/p/346276216)

[express-fileupload](https://github.com/richardgirges/express-fileupload)

[How to add typescript to Vue 3 and Vite project](https://stackoverflow.com/questions/63724523/how-to-add-typescript-to-vue-3-and-vite-project)
