# hypertextEditor

<h3 align="center">
    一个轻量、极简的JavaScript富文本插件
</h3>

<br/>

<p align="center">
  <a href="https://www.npmjs.com/package/hypertextEditor">
    <img
     alt="NPM URL"
     src="https://img.shields.io/badge/npm-hypertextEditor?logo=npm">
  </a>
  <a href="https://www.jsdelivr.com/package/npm/hypertextEditor">
    <img
     alt="JSDelivr URL"
     src="https://img.shields.io/badge/JsDelivr-ff5627">
  </a>
  <img
     alt="version"
     src="https://img.shields.io/badge/version-1.0.0-blue">
</p>

<br>

<h4 align="center">
  <a href="https://kid-1912.github.io/hypertextEditor/examples/">Featured demo</a>
</h4>

<br>

-------------

## Getting Started

#### Node

```shell
npm install hypertextEditor -S
```

### Brower

jsdelivr:

```html
<script src=""></script>
<script>
  const editor = new HypertextEditor({
    el: "#editor",
    ...
  })
</script>
```

## Usage

```js
import Editor from "hypertextEditor"
const editor = new Editor({
  el: "#editor",
  content: "默认文本",
  maxlength: 12,
});
```

> You can find more examples [here](EXAMPLES.md).

## Events

| Event             | Description | Arguments                           |
| ----------------- | ----------- |:-----------------------------------:|
| `change`          | 编辑区内容改变     | -                                   |
| `selectionchange` | 编辑区选区改变     | `state`："color"\|"bold"\|"fontSize"\|"text" |

> Example:

```js
editor.on("change", function () {
  console.log("编辑结果：", this.content);
});
const handle = editor.on("selectionchange", function (state) {
 console.log("选区内容状态：", state); // 选区清除时返回 null
});
editor.off("selectionchange", handle);
```

## Options

```js
static defaultOptions = {
  el: "#editor", // Selector or element
  content: "",  // default content
  maxlength: Infinity, // Max length of text content
  mode: "textarea", // "textarea" | "input"
};
```

## Properties

- editor.el: 编辑区dom

- editor.content: 编辑区html内容

- editor.text: 编辑区纯文本内容

- editor.color: 编辑区文字颜色值

- editor.bold: 编辑区文字加粗状态

- editor.fontSize: 编辑区文字字号

## Methods

- editor.format(attr, value): 仅对当前选区文本格式化 `attr:["color"|"bold"|"fontSize"]`

- editor.formatText(attr, value): 对编辑区整体文本格式化，参数同 `format`

- editor.on(event`:String`, cb`:Function`) : 添加事件监听

- editor.remove(event`:String`, handler`:Function`) : 移除事件监听

- editor.getSelection(): 获取编辑区选区(选区API集合)

## Planned Features

- Placeholder

- Parsing textContent styles

- Supports emoticons, images, videos, 

- Import font-family, heading, backgrounds, margins paddings, border

## FAQ

### 选区丢失导致设置颜色失败

> 选中编辑区文字后，点击颜色控件时，编辑区选区丢失

**解决：**

控件使用 `button` 元素类型或取消控件的 `mousedown` 事件默认行为

```js
$colorPicker.addEventListener("mousedown", (event) => {
  event.preventDefault();
});
```

### 第三方控件设置颜色（以pickr为例）

> 颜色控件的设置颜色面板存在颜色值输入框，输入颜色值时编辑区选区丢失

解决：

颜色面板展开时，手动存储选区；颜色面板关闭/颜色值设置完成时，手动恢复选区后再调用editor设置颜色API

```js
// 选区保存与恢复
let selection;
pickr.on("show", () => {
  selection = editor.getSelection();
  selection.saveRange(); // 存储选区
});

pickr.on("save", () => {
  selection.restoreRange(); // 恢复选区
  const colorString = pickr.getColor().toRGBA().toString(0);
  editor.format("color", colorString); // 设置颜色
  $colorPicker.style.backgroundColor = colorString;
  pickr.hide();
});
```

### 单行输入框

自定义 `#editor` 样式

```css
#input {
  width: 240px;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  overflow-x: auto; // 横向滚动
  white-space: nowrap;  // 单行
}

const editor = new HypertextEditor({
  el: "#input",
  mode: "input",
  ...
})
```

### 关于样式

HypertextEditor作为富文本插件，仅负责HTML内容的编辑（数据层面），不控制内容页面展示，具体如：white-space、word-break、默认字号、默认行高等都继承自页面样式，自行定义样式控制。

## Relations

**@simonwep/pickr:** https://github.com/simonwep/pickr

**wangEditor:** https://github.com/wangeditor-team/wangEditor

**quilljs:** https://github.com/quilljs/quill

