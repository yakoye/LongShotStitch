# LongShotStitch

LongShotStitch 是一个网页版本的长截图拼接与裁剪工具。

当前版本：v1.22

这个工具的想法参考了 Picsew。换到安卓手机之后，我发现安卓上很难找到一款能媲美 Picsew 的长截图拼接工具，于是仿照它的核心体验做了一个网页版本。它不依赖某个特定手机系统，只要设备有浏览器，就可以在手机、平板、电脑上使用。

## 适用场景

- 多张截图自动拼接成长图
- 对长图进行裁剪、旋转和基础调整
- 添加标注、文字和辅助说明
- 自动判断纵向或横向拼接
- 从视频截图中提取字幕区域并拼成长图
- 将单张图片切成多页、横向/纵向多分或九宫格
- 在不同设备之间保持一致的使用方式
- 不想安装 App，只想打开网页直接处理图片

## 在线发布

项目是纯静态网页，可以部署到 Cloudflare Pages、Workers Static Assets、GitHub Pages 或任意静态网站服务。

当前入口文件：

- `index.html`：默认访问入口，直接加载主工具页面
- `LongShotStitch.html`：主工具页面

部署时至少需要上传：

- `index.html`
- `LongShotStitch.html`

如果使用 Cloudflare 的 `Visit` 按钮访问根地址，必须保留 `index.html`，否则根路径 `/` 会找不到页面。

## 本地使用

直接用浏览器打开 `LongShotStitch.html` 即可使用。

也可以打开 `index.html`，它会直接加载同一个工具页面。

## 开发与检查

仓库里包含几个简单检查脚本：

```bash
node tests/entry_check.js
node tests/static_check.js
node tests/smoke_check.js
```

这些脚本用于确认：

- 发布入口 `index.html` 直接加载工具页
- 最新版本页面包含关键功能标记
- 主页面脚本可以被正常解析

完整测试规则见 `docs/测试规则.md`。

## 说明

Picsew 是这个工具的体验参考对象。本项目不是 Picsew 官方项目，也不与 Picsew 官方存在关联。
