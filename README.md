### Vless+ws+tls 单节点部署+多优选域名+CF保活方案 说明：

* 适用Webfreecloud、Web.C-Servers的DirectAdmin面板node.js环境 
  
* 随机端口，无需担心端口占用困扰

* 多区域优选域名覆盖，延迟低，网络表现优异

* （若节点经常出现-1可选）Cloudflare Workers保活方案：https://github.com/eishare/keep-alive-DirectDdmin-Node.js
-----------------------------------------------------------

### 使用方法：

* 1：更新DirectAdmin面板域名，确保域名已托管至Cloudflare，并添加一条DNS记录，指向DirectAdmin

* 2：index.js+package.json上传至服务器public_html目录
   修改index.js中的2个变量：UUID、DOMAIN

* 3：进入面板--附加功能--Setup Node.js APP
   
     *输入：
          路径：public_html
          文件：index.js

     *然后：
  CREATE APPLICATION
  run npm install
  运行js--点击start--运行
  
* 4：浏览器访问 域名/UUID，可见节点链接地址
