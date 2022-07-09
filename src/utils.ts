/**
 * 控制并发数量
 * 
 * @param collection 待执行的任务数组
 * @param limit 最大并发数量
 * @param asyncCallback 要执行的异步回调
 */
export const concurrent = async function <T, R>(
    collection: T[], limit: number, asyncCallback: (item: T) => Promise<R>
): Promise<[any[], R[]]> {
    // 用于在 while 循环中取出任务的迭代器
    const taskIterator = collection.entries();
    // 任务池
    const pool = new Set();
    // 最终返回的结果数组
    const finalResult: R[] = [];
    // 最终返回的异常数组
    const finalError: any[] = [];

    do {
        const { done, value: [index, task] = [] } = taskIterator.next();
        // 任务都已执行，等待最后的剩下的任务执行完毕
        if (done) {
            await Promise.allSettled(pool);
            break;
        };

        // 将结果存入结果数组，并从任务池中移除自己
        const promise = asyncCallback(task)
            .then(data => finalResult[index] = data)
            .catch(error => finalError[index] = { error, task })
            .finally(() => pool.delete(promise))

        // 达到上限后就等待某个任务完成
        if (pool.add(promise).size >= limit) {
            await Promise.race(pool);
        }
    } while (true)

    return [finalError, Array.from(finalResult)];
}

/**
 * 从入口样式路径生成样式名
 */
export const getEntrySaveName = (sourceEntryUrl: string) => {
    try {
        const sourceUrl = new URL(sourceEntryUrl)
        const fileName = sourceUrl.searchParams.getAll('family')
            .map(family => family.split(':')[0].toLowerCase().replace(/\s/g, '-'))
            .join('_')
        
        return fileName
    }
    catch (e) {
        console.error('文件名生成出错')
        return Date.now().toString()
    }
}