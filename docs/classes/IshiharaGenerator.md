[**ishihara-generator**](../../README.md)

***

[ishihara-generator](../globals.md) / IshiharaGenerator

# Class: IshiharaGenerator

石原氏色盲检测图生成器

## Constructors

### new IshiharaGenerator()

> **new IshiharaGenerator**(`width`, `height`, `options`): [`IshiharaGenerator`](IshiharaGenerator.md)

构造函数

#### Parameters

##### width

`number`

生成器的宽度

##### height

`number`

生成器的高度

##### options

[`IshiharaOptions`](../interfaces/IshiharaOptions.md) = `{}`

选项

#### Returns

[`IshiharaGenerator`](IshiharaGenerator.md)

#### Defined in

ishihara.ts:104

## Methods

### generate()

> **generate**(`totalCircles`): `Promise`\<`void`\>

生成圆

#### Parameters

##### totalCircles

`number` = `2000`

总圆数

#### Returns

`Promise`\<`void`\>

#### Defined in

ishihara.ts:190

***

### save()

> **save**(`outputPath`): `Promise`\<`void`\>

保存图片

#### Parameters

##### outputPath

`string`

保存的路径

#### Returns

`Promise`\<`void`\>

#### Defined in

ishihara.ts:258
