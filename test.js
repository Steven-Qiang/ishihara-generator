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