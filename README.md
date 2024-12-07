# ishihara-generator
基于NodeJS的自定义内容石原氏色盲检测图生成器

- [查看文档 (view docs)](docs/classes/IshiharaGenerator.md)

## 测试输出

```javascript
const { IshiharaGenerator } = require('.');
(async () => {
    const [width, height] = [1024, 1024];
    const generator = new IshiharaGenerator(width, height, {
        text: '1234',
        fontSize: width / 3
    });
    await generator.generate(1500);
    await generator.save('test_output.png');
})();
```

![test_output.png](test_output.png)