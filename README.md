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
