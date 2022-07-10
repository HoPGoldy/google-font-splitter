# google-font-splitter

![](https://img.shields.io/npm/v/google-font-splitter)
![](https://img.shields.io/github/languages/code-size/hopgoldy/google-font-splitter)

将 google-font 提供的在线字体文件下载至本地的工具。

google-font 提供的在线字体使用了 `unicode-range` 进行了字体包分割，可以有效的提升字体的加载速度。

但由于网络、环境等问题影响，某些项目不能正常的引用 google 字体，所以这个工具会将指定的谷歌在线下载至本地，以便于项目直接本地引用。

## 安装

需求：`node 12+`

```shell
npm install -g google-font-splitter
```

## 如何使用

本工具的使用分为两步，获取在线字体链接、下载字体文件。

**第一步：获取在线字体链接**

打开 [google fonts](https://fonts.google.com/)，搜索选择要下载的字体。

在字体详情页向下滚动找到 Styles，并在点击要使用的字体右侧的 **Select this style** 按钮。

[![jsa2Ox.png](https://s1.ax1x.com/2022/07/10/jsa2Ox.png)](https://imgtu.com/i/jsa2Ox)

在右侧的 **Selected family** 面板下方找到找到在线字体链接并将其复制出来（只需要链接即可，**不需要** 复制整行 link 标签）：

[![jsag61.png](https://s1.ax1x.com/2022/07/10/jsag61.png)](https://imgtu.com/i/jsag61)

**第二步：下载字体文件**

找一个空文件夹，并执行如下命令：

```bash
google-font-splitter "https://你复制出的在线字体链接"
# 例如 google-font-splitter "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;300;400&display=swap"
```

回车后工具将会打印如下输出：

```
downloading entry css file...
recast entry file and generating font download tasks...
save entry css file...
downloading font source ======================================== 100% 291/291
download complate, save to D:\project\google-font-splitter\font-result\noto-sans-sc
```

然后你就可以在日志最后一行的文件夹中找到下载好的字体文件夹了，目录如下：

```
noto-sans-sc
├── s/notosanssc/xxx/...
└── noto-sans-sc.css
```

包含一个存放分割好的字体文件的文件夹和一个与目录同名的 css 文件，这个 css 文件即为入口文件。**只需要将该文件夹复制到你的项目中并使用 \<link /> 标签引用进来即可。**

## 命令行参数及配置项

你可以随时使用 `--help` 参数查看帮助信息。

- **参数 `url`**

    工具只接受一个参数，即 google fonts 的在线字体链接，请确保该链接指向的是一个 css 文件。

- **配置项 `-r, --root <path>`**

    字体入口 css 文件引入字体源文件的路径前缀，默认为同级相对路径（*所以默认时需要把入口 css 和字体源文件放在同级目录下*）。
    
    你可以通过该参数指定字体源文件的存放位置。例如将字体存放至独立的 cdn 网络：

    ```
    google-font-splitter "https://fonts.googleapis.com/..." -r https://your-custom-cdn/public/fonts/
    ```

- **配置项 `-d, --dist <savePath>`**

    字体文件要下载到的位置，默认为 `./font-result`。

- **配置项 `-n, --name <fileName>`**

    字体入口文件的名称，即下载目录中的文件夹名称和其中的入口 css 文件名。
    
    默认会从提供的 google fonts 链接中解析，当解析失败时会使用当前的毫秒时间戳。

- **配置项 ` -c, --concurrent <number>`**

    下载分割的字体源文件时的并发数量，默认为 30。

## 在项目中引用

使用方式非常简单，只需要使用 `<link href="xxx.css" rel="stylesheet">` 将下载好的字体入口文件引入进来即可。

下面是一些常见框架的引用方式（假定下载好的字体文件存放在 noto-sans-sc 文件夹中，且入口文件为 `noto-sans-sc/noto-sans-sc.css`）：

**vue2（vue-cli）**

将下载好的字体文件夹复制进 vue2 项目的 `/public` 中。

在 `/public/index.html` 中引用字体入口文件：

```html
<link href="<%= BASE_URL %>noto-sans-sc/noto-sans-sc.css" rel="stylesheet">
```

然后在需要的地方设置字体 font-family 即可：

```css
#app {
  font-family: 'Noto Sans SC', sans-serif;
}
```

**vue3（vite）**

将下载好的字体文件夹复制进 vite 项目的 `/public` 中。

在 `/index.html` 中引用字体入口文件：

```html
<!-- 注意 vite 项目直接从根目录引用 public 中的文件即可 -->
<link href="/noto-sans-sc/noto-sans-sc.css" rel="stylesheet">
```

最后在需要的地方设置字体 font-family 即可。

**react（create-react-app）**

首先将下载好的字体文件夹复制进 react 项目的 `/public` 中。

然后在 `/public/index.html` 中引用字体入口文件：

```html
<link href="%PUBLIC_URL%/noto-sans-sc/noto-sans-sc.css" rel="stylesheet">
```

最后在需要的地方设置字体 font-family 即可。

## 许可

详见 [google-fonts license](https://github.com/google/fonts#license)。

## 参考

本工具使用如下依赖开发:
[fs-extra](https://github.com/jprichardson/node-fs-extra)
[chalk](note.youdao.com/web/#/file/B32A092E6C2E45DDB3CED7097A92057C/markdown/9E130E1FE7374FAC8579C1CC0B85B96E/)
[node-fetch](https://www.npmjs.com/package/node-fetch)
[css-tree](https://github.com/csstree/csstree)。