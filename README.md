# electron-ae
this is ae tool designed on electron platform
基于layabox做的二次开发，对美术的序列图进行动画编辑和打包

# 技术点说明
## 渲染进程
1. 界面是采用layabox开发，layabox有可视化界面，拼凑界面简单方便;
2. layabox中ts生成js的模式为`es6`, 因为需要引入electron的api，与进程进行通信，所以需要修改为`commonjs`模式;
3. 由于2的原因，所以在index.js中，需要用require方法，将核心库js和入口js加载;

## 主进程
1. 将系列图导出图集，采用的是layabox `atlas-generator.exe`工具，在layabox的程序目录下可以找得到  
2. 将图集导出为序列图，引入`nodejs`的第三方库`images`，该库存在一些问题，无法将图按负的偏移量导出，比如：将A图的中心点，draw到B图的(0,0)点。幸好作者提供的源码，修改draw函数这块的代码：
原始代码：
```
for (sy = 0; sy < h; sy++)
{
    sp = src->data[sy];
    dp = &(data[y + sy][x]);
    memcpy(dp, sp, size);
}
```
修改
```
if (x >= 0 && y >= 0)
{
    for (sy = 0; sy < h; sy++)
    {
        sp = src->data[sy];
        dp = &(data[y + sy][x]);
        memcpy(dp, sp, size);
    }
}
else if (x >= 0 && y < 0)
{
    for (sy = -y; sy < h; sy++)
    {
        sp = src->data[sy];
        dp = &(data[y + sy][x]);
        memcpy(dp, sp, size);
    }
}
else if (x < 0 && y >= 0)
{
    for (sy = 0; sy < h; sy++)
    {
        sp = &(src->data[sy][-x]);
        dp = &(data[y + sy][0]);
        memcpy(dp, sp, size);
    }
}
else
{
    for (sy = -y; sy < h; sy++)
    {
        sp = &(src->data[sy][-x]);
        dp = &(data[y + sy][0]);
        memcpy(dp, sp, size);
    }
}
```
然后用 `node-gyp` 重新编译一下，将build目录拷贝到node_modules/images目录下  
> 注意 `node-gyp` 请用python2的环境

# 打包
1. 以前使用 `electron-package` 进行打包的，网上查了一下 `electron-builder` 更为强大，根据网上教程安装好环境。
2. 打包后觉得程序太大，看了一下打包后的目录，发现node_modules打包了很多库，网友的一篇 [你不知道的 Electron (二)：了解 Electron 打包](https://imweb.io/topic/5b6817b5f6734fdf12b4b09c) 给了我一些启发：  
我的工具中只用到了 `images` 这一个第三方库，而 `images` 库运行又依赖于一个 `mkdirp`的库，看了一下 `mkdirp`库的代码，只有一个js文件，将其拷贝到 `images` 的 `scripts`目录，
修改代码的引用，由于我只用到 `images` 库中图片裁剪功能，只需要 `build/Release/binding.node`文件，删除其他文件，库少了很多。

3. 修改 `electron-builder` 的打包参数，其参数在 `package.json` 的 `build`节点， 将需要打包的程序白名单按目录规则列到 `files`中。

4. 在 `bin` 新建一个 `package.json`文件，配置打包后 `electron` 的运行参数
```
{
    "name": "electron-ae",
    "version": "1.0.0",
    "description": "this is ae tool designed on electron platform",
    "main": "app.js",
    "repository": {
        "type": "git",
        "url": "git+https://github.com/silenxiao/electron-ae.git"
    },
    "author": "silenxiao",
    "license": "ISC",
    "bugs": {
        "url": "https://github.com/silenxiao/electron-ae/issues"
    },
    "homepage": "https://github.com/silenxiao/electron-ae#readme",
    "dependencies": {
        "images": "^3.0.2"
    }
}
```