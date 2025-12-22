### Vless+ws+tls 单节点部署+多优选域名+自动保活方案 说明：

* 适用DirectAdmin面板node.js环境 
   （在Webfreecloud测试完美，Webfreecloud待测试）
  
* 随机端口，无需担心端口占用困扰

* 多区域优选域名覆盖，延迟低，网络表现优异！
  
* 代码添加保活，每2分钟访问一次domain/uuid

* （非必选）Cloudflare Workers保活方案：https://github.com/eishare/keep-alive-DirectDdmin-Node.js
-----------------------------------------------------------

### 使用方法：

* 1：域名托管至Cloudflare，添加一条DNS记录

* 2：index.js+package.json上传至服务器public_html目录
   修改index.js中的2个变量：UUID/DOMAIN

* 3：进入面板：附加功能--Setup Node.js APP
   
     *输入：
          public_html 和 index.js

     *然后：
           CREATE APPLICATION，运行安装npm、运行js
   
* 4：域名/UUID，浏览器访问可见节点链接地址
