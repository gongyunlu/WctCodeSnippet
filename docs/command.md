# 指令使用示例

 - 指令集通过案件的config.json配置生成

如下所示：
```javascript
{
    "id": "test_001", // 案件ID/编号 
    "name": "测试案件1", // 案件名称
    "type": "测试", // 案件类型
    "manager": "张三", // 经办人员
    "missionCount": 560, // 任务量
    "createTime": 1628056887963, // 创建时间
    "actions": [ // 录制的动作组，每一个动作即为一个指令
        {
            "id": "cmd_0001",
            "name": "Beginning",
            "options": null
        },
        {
            "id": "cmd_0002",
            "name": "OpenPage",
            "options": {
                "url": "https://www.cnblogs.com/"
            }
        },
        {
            "id": "cmd_0003",
            "name": "Waiting",
            "options": {
                "milliseconds": 2000
            }
        },
        {
            "id": "cmd_0004",
            "name": "Pagination",
            "options": {
                "interceptorMode": "request",
                "frameUrl": "https://www.cnblogs.com/",
                "selector": ".pager a:last-child",
                "options": {
                    "request": {
                        "method": "post",
                        "url": "https://www.cnblogs.com/AggSite/Pager",
                        "tempPayloads": [
                            {
                                "key": "PageIndex",
                                "value": "100"
                            }
                        ]
                    }
                }
            }
        },
        {
            "id": "cmd_0005",
            "name": "Screenshot",
            "options": {
                "path": "D:\\TelecomFraud\\src\\core\\shots",
                "saveType": "jpeg",
                "type": "page"
            }
        },
        {
            "id": "cmd_0006",
            "name": "Ending",
            "options": null
        }
    ]
}

## 所有指令的统一构造器

​```javascript
    /**
     * @param {String} id 指令的ID
     * @param {Context} context 指令执行上下文
     * @option {Object} options 参数
     */
    new (id, context, options);
```

## Beginning - 开始指令

创建任务的主页面,即新建标签页

``` javascript
new Beginning(id, context);
```

## Click - 点击指令

点击页面内的元素

```javascript
/**
 * 指令-点击
 * 点击判断完成的条件,不进行同时判断,按照waitingSelector、waitingUrl、waitingBingdingEvent优先级进行判断
 * 1. waitingSelector - 等待指定元素出现
 * 2. waitingUrl - 等待指定接口返回
 * 3. waitingBingdingEvent - 等待元素绑定的事件执行完毕
 */
new Click(id, context, {
    frameUrl: String, // 点击元素所在的iframe的url
    selector: String, // 点击元素的选择器
    timeout: Number, // 超时时间(毫秒),默认为30000
    clickCount: Number, // 点击次数,默认为1
});
```

## Ending - 结束指令

所有功能指令执行完毕,关闭页面

```javascript
new Ending(id, context);
```

## KeyboardEnter - 键盘输入指令

选择元素,模拟键盘输入指定字符串

```javascript
new KeyboardEnter(id, context , {
    frameUrl: String, // 选择元素所在iframe的url
    selector: String, // 原则元素的选择器
    text: String, // 输入的值
    enter: Boolean // 输入完成后是否按回车键
})
```

## Loop - 循环指令

将配置的指令集循环执行指定次数

```javascript
new Loop(id, context, {
    cycles: Number, // 循环的次数
    waitingTime: Number, // 执行完一次后等待指定毫秒数进行下一次循环
    commandList: [ // 单次循环的指令集
        {
            id: String, // 指令ID
            name: String, // 指令名
            options: Object // 参数列表
        }
    ]
})
```

## OpenPage - 打开页面指令

打开指定页面

```javascript
new OpenPage(id, context, {
    url: String, // 网页链接
    isExistPage: Boolean, // 是否为已存在的页面(浏览器连接前打开的页面),默认为false
    retry: Number, // 重试次数,默认为1
    timeout: Number // 超时时间(毫秒),默认为30000
});
```

## Pagination - 分页跳转指令

跳转到指定页码的页面,首先篡改页面跳转的DOM所绑定的属性或篡改分页请求参数,再点击该元素进行跳转

1. 篡改request请求

```javascript
/**
 * GET请求
 * 篡改请求url
 */
new Pagination(id, context, {
    interceptorMode: String, // 拦截器模式 attribute -> 篡改某个元素上的属性   request -> 篡改请求参数
    frameUrl: String, // 目标元素所在iframe的url
    selector: String, // 目标元素的选择器
    options: {
        request: {
            method: 'get',
            url: String, // 请求url
            tempPayloads: [ // 篡改的属性的键值对
                {
                    key: String, // 属性名
                    value: any // 替换后的属性值
                }
            ]
        }
    }
})


/**
 * POST请求
 * 篡改请求参数
 */
new Pagination(id, context, {
    interceptorMode: String, // 拦截器模式 attribute -> 篡改某个元素上的属性   request -> 篡改请求参数
    frameUrl: String, // 目标元素所在iframe的url
    selector: String, // 目标元素的选择器
    options: {
        request: {
            method: 'post',
            url: String, // 请求url
            tempPayloads: [ // 篡改的属性的键值对
                {
                    key: String, // 属性名
                    value: any // 替换后的属性值
                }
            ]
        }
    }
})
```

2. 篡改元素的属性

```javascript
new Pagination(id, context, {
    interceptorMode: 'attribute',
    frameUrl: String, // 目标元素所在iframe的url
    selector: String, // 目标元素的选择器
    options: {
        attrList: [ // 篡改的属性的键值对
            key: String, // 属性名
            value: String // 替换后的属性值
        ]
    }
})
```

3. 输入页码跳转

点击Enter键与点击跳转按钮互斥,当pressEnter为True时点击分页按钮会不生效.

```javascript
new Pagination(id, context, {
    interceptorMode: 'enter',
    options: {
        inputSelector: String, // 输入框的选择器
        inputFrameUrl: String, // 输入框所在iframe的url
        pageNumber: String, // 需要跳转的页码
        pressEnter: Boolean, // 是否需要点击Enter键
        pagerSelector: String, // 跳转按钮的选择器
        pagerFrameUrl: String, // 跳转按钮所在的选择器
    }
})
```

4. 直接篡改请求链接

```javascript
new Pagination(id, context, {
    interceptorMode: 'temp',
    frameUrl: String, // 目标元素所在iframe的url
    selector: String, // 目标元素的选择器
    options: {
        url: String, // 原请求url
        tempUrl: String // 替换后的请求url
    }
})
```

## Screenshot - 截图指令

对指定元素或整个页面进行截图

1. 对整个页面进行截图
```javascript
new Screenshot(id, context, {
    path: String, // 图片存储路径
    saveType: String, // 保存格式 jpeg 或 png
    type: 'page'
})
```

2. 对指定元素进行截图
```javascript
new Screenshot(id, context, {
    path: String, // 图片存储路径
    saveType: String, // 保存格式 jpeg 或 png
    type: 'dom',
    options: {
        frameUrl: String, // 目标元素所在iframe的url
        selector: String // 目标元素的选择器
    }
})
```

## Waiting - 定时等待指令

等待指定毫秒数或随机等待给定范围的毫秒数

```javascript
1. 定时等待
new Waiting(id, context, {
    waitingFor: 'timed',
    options: {
        milliseconds: Number // 等待的毫秒数
    }
})

2. 随机时长等待
new Waiting(id, context, {
    waitingFor: 'randomTime',
    options: {
        minMilliseconds: Number, // 最小等待毫秒数
        maxMilliseconds: Number, // 最大等待毫秒数
    }
})

3. 等待元素渲染/消失
new Waiting(id, context, {
    waitingFor: 'selector',
    options: {
        frameUrl: String, // 需要等待的元素所在iframe的url
        selector: String, // 需要等待的元素的选择器
        timeout: Number, // 等待超时时间,单位为毫秒,默认为30000
        visible: Boolean // 等待元素渲染(true)/消失(false)
    }
})

4. 等待接口返回
new Waiting(id, context, {
    waitingFor: 'request',
    options: {
        requestUrl: String, // 需要等待返回的接口
        timeout: Number, // 等待超时时间,单位为毫秒,默认为30000
    }
})
```

## Scroll - 页面滚动指令

滚动页面：

1. 将指定元素滚动到可视区域
2. 滚动指定高度，可以指定负数
3. 采用[组合按键](https://github.com/puppeteer/puppeteer/blob/v10.1.0/src/common/USKeyboardLayout.ts)的方式进行滚动

```javascript
// 将元素滚动到可视区域
new Scroll(id, context, {
    dom: {
        selector: String, // 需要滚动到可视区域的元素
        frameUrl: String // 需要滚动倒可视区域的元素的iframe的url
    }
})
// 滚动指定高度
new Scroll(id, context, {
    y: -200 // 向上滚动200px
})
// 采用组合按键方式进行滚动
new Scroll(id, context, {
    keyboard: 'PageDown'
})
// 懒加载滚动至元素加载完成
new Scroll(id, context, {
    scrollLoad: {
        selector: String, // 需要滚动到可视区域的元素
        frameUrl: String // 需要滚动倒可视区域的元素的iframe的url
    }
})
```


## ClickNextPage - 点击下一页按钮

滚动页面：

1. 点击下一页按钮

```javascript
new ClickNextPage(id, cpontext , {
    frameUrl: "", // 下一页按钮所在的iframe的url
    selector: "", // 下一页按钮的选择器
    paginationContainer: "", // 分页按钮的容器的选择器
    nodeNameOfNextPage: "", // 下一页按钮的节点tagNamge
    flagOfNextPage: "", // 下一页按钮的innerText
})
```

## ManuallyIdentify - 数据抓取指令
抓取数据：

```javascript
new ManuallyIdentifyHelper({
    frameUrl:"", // 元素区域所在的iframe的url
    area:"",//元素区域选择器
    rowSelector: "",//表格行选择器
    colSelector:[],//表格列选择器
    standard:true,//是否标准表格（true:标准表格；false:非标准表格）
    headData:[],//需要识别的表格表头数据。
    filePath:""//抓取JSON文件存放文件夹路径
});
```

