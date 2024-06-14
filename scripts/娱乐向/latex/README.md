# latex渲染

## 安装

### docker启动服务版

1. 安装docker
    参考[docker安装](https://docs.docker.com/get-docker/)
2. 安装 `math-api`
    `docker run --name math-api -d -p 3000:3000 chialab/math-api`
3. 编写js脚本请求 (cq码即可, 需要经过urlencode)
    参考同目录下 js 脚本, 需要修改请求地址以及端口号
4. 将请求返回的png透明图片转换成白底黑字的图片(可选的)
    编写相关服务转换, 参考同目录下python脚本

### 使用国外math-api版 (需要连接到国外)

1. 根据链接 `https://math.vercel.app` 编写js请求脚本(cq码即可, 需要经过urlencode), 详细参考 [math-api](https://github.com/uetchy/math-api)
