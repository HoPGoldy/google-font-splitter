import { ensureDir, emptyDir } from 'fs-extra'
import { writeFile } from 'fs/promises'
import path from 'path'
import { URL } from 'url'
import fetch from 'node-fetch'
import { FETCH_HEADERS as headers } from './config'
import csstree, { StringNode } from 'css-tree'
import { concurrent, getEntrySaveName } from './utils'
import { Presets, SingleBar } from 'cli-progress';

/**
 * 命令参数
 */
interface AppCommandOptions {
    root: string
    dist: string
    name?: string
    concurrent: string
}

/**
 * 字体源文件下载任务
 * 从 google 入口 css 中解析得来
 */
interface DownloadTask {
    /**
     * 下载路径
     */
    url: string
    /**
     * 保存到的地址
     */
    localPath: string
    /**
     * 保存文件名
     */
    saveFileName: string
}

/**
 * 【核心】解析并下载 google 字体
 */
export const downloadFont = async (sourceEntryUrl: string, options: AppCommandOptions): Promise<void> => {
    // console.log('options', options)
    const entrySaveName = options.name || getEntrySaveName(sourceEntryUrl)
    const distDir = path.resolve(process.cwd(), options.dist, entrySaveName)

    await emptyDir(distDir)

    // 下载入口 css 文件
    console.log('downloading entry css file...')
    const resp = await fetch(sourceEntryUrl, { headers })
    const cssData = await resp.text();
    const ast = csstree.parse(cssData);

    const srcNodes = csstree.findAll(ast, node => node.type === 'Url') as csstree.Url[];

    // 调整入口 css 中的路径，并生成字体源文件下载任务
    console.log('recast entry file and generating font download tasks...')
    const downloadTasks: DownloadTask[] = srcNodes.map(node => {
        const fontSrc = new URL(node.value as unknown as string);
        // 网络路径第一个字符一般都是 /，转换成本地会被认为是绝对路径，要先去除
        const pathname = fontSrc.pathname[0] === '/' ? fontSrc.pathname.slice(1) : fontSrc.pathname;
        const pathDetail = path.parse(pathname);

        // 把网络路径转换成本地路径
        let targetPath = fontSrc.pathname.replace(pathDetail.root, options.root);
        if (targetPath.startsWith('/')) targetPath = targetPath.slice(1);
        node.value = targetPath as unknown as StringNode;

        return {
            url: fontSrc.href,
            localPath: path.resolve(distDir, pathDetail.dir),
            saveFileName: pathDetail.base
        }
    })

    console.log('save entry css file...')
    const dist = csstree.generate(ast);
    await writeFile(path.join(distDir, entrySaveName + '.css'), dist);

    // 确保下载所需的路径都已存在
    const savePaths = Array.from(new Set(downloadTasks.map(task => task.localPath)))
    for (const savePath of savePaths) {
        await ensureDir(savePath);
    }

    const downloadFormat = 'downloading font source {bar} {percentage}% {value}/{total}';
    const downloadBar = new SingleBar({ format: downloadFormat, fps: 10 }, Presets.legacy);

    downloadBar.start(downloadTasks.length, 0);
    // 并发下载所有字体源文件
    await concurrent(downloadTasks, Number(options.concurrent), async (task) => {
        const resp = await fetch(task.url, { headers })
        await writeFile(path.resolve(task.localPath, task.saveFileName), await resp.buffer());
        downloadBar.increment()
    })
    downloadBar.stop()

    console.log(`download complate, save to ${distDir}`)
}