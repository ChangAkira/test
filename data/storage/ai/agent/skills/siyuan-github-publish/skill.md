---
name: 发布文档到 GitHub
description: 通过 siyuan-github-publish-plugin（GitHub 发布插件）把当前文档导出为 Markdown 并发布到指定 GitHub 仓库。当用户说“发布至 GitHub / 发布到 GitHub / 上传这篇文章到 GitHub / 把这篇笔记发到 GitHub”等时使用：先询问要发布的仓库名称，把「ChangAkira/仓库名称」填入插件配置项后再触发发布。
---

# 发布文档到 GitHub（siyuan-github-publish-plugin）

## 适用插件
- 插件名：**GitHub 发布插件**（`siyuan-github-publish-plugin`），v0.1.0，作者 WuRang。
- 顶栏按钮 `aria-label`：`发布到 GitHub`（图标 `#iconGitHub`）。
- 能力：把**当前打开的文档**导出为 Markdown（自动带上图片），上传到 `<basePath>/<上传目录名>/index.md`。**一次只发布一篇文档**。

## 关键信息
- 配置文件：`data/storage/petal/siyuan-github-publish-plugin/github-publish-config.json`
- 配置字段：`githubUsername`、`accessToken`、**`repository`（必须为 `用户名/仓库名`）**、`branch`、`basePath`、`customDomain`、`frontMatter`
- 发布记录：`data/storage/petal/siyuan-github-publish-plugin/github-publish-records.json`
- **配置改动必须通过插件「插件设置」界面保存**：插件在内存中缓存配置，直接改 JSON 文件不会生效。

## 安全要求
- **绝不输出、绝不回显 `accessToken`**。需要读取配置时，只取 `githubUsername` 等非敏感字段，不打印 token。

## 工作流

### 第 0 步：确认目标文档
- 默认发布**当前打开（激活）的文档**。
- 若用户指定了某篇文档，先确认它就是当前激活的标签页；若不是，请用户先在 SiYuan 里打开该文档，再继续。

### 第 1 步：询问仓库名称（必须，不可猜测）
用**普通消息**询问用户：要发布到哪个 GitHub 仓库？只需给仓库名称（例如 `SIYUANtest2`）。
**拿到用户回复前不要继续**。

### 第 2 步：打开插件设置，读取 GitHub 用户名
点击顶栏按钮打开菜单：
```javascript
const d = window.document;
const bar = Array.from(d.querySelectorAll('.toolbar__item')).find(el => (el.getAttribute('aria-label')||'') === '发布到 GitHub');
if (!bar) return 'topbar not found';
bar.click();
return 'menu opened';
```
点击菜单项「插件设置」：
```javascript
const d = window.document;
const item = Array.from(d.querySelectorAll('.b3-menu__item')).find(it => (it.textContent||'').includes('插件设置'));
if (!item) return 'settings item not found';
item.click();
return 'settings opened';
```
读取当前 GitHub 用户名（作为仓库 owner）：
```javascript
const d = window.document;
const dlg = d.querySelector('.b3-dialog');
if (!dlg) return 'no dialog';
const label = Array.from(dlg.querySelectorAll('.b3-label')).find(l => l.textContent.includes('GitHub 用户名'));
const input = label && label.querySelector('input.b3-text-field');
return input ? input.value : 'username not found';
```

### 第 3 步：填入 `<用户名>/<仓库名称>` 并保存
把下方 `REPO_FULL` 换成实际值（例如 `ChangAkira/SIYUANtest3`）：
```javascript
const d = window.document;
const REPO_FULL = 'REPO_FULL';
const dlg = d.querySelector('.b3-dialog');
if (!dlg) return 'no dialog';
const label = Array.from(dlg.querySelectorAll('.b3-label')).find(l => l.textContent.includes('仓库地址'));
const input = label && label.querySelector('input.b3-text-field');
if (!input) return 'repo input not found';
input.value = REPO_FULL;
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
return input.value;
```
点击「保存」（会弹出“配置保存成功”）：
```javascript
const d = window.document;
const dlg = d.querySelector('.b3-dialog');
const btn = dlg && Array.from(dlg.querySelectorAll('button')).find(b => b.textContent.trim() === '保存');
if (!btn) return 'save button not found';
btn.click();
return 'saved';
```
保存后关闭设置窗（点「取消」不会回滚已保存内容）：
```javascript
const d = window.document;
const dlg = d.querySelector('.b3-dialog');
const btn = dlg && Array.from(dlg.querySelectorAll('button')).find(b => b.textContent.trim() === '取消');
if (btn) { btn.click(); return 'closed'; }
return 'no cancel button';
```

### 第 4 步：发布当前文档
打开菜单并点「发布当前笔记」：
```javascript
const d = window.document;
const bar = Array.from(d.querySelectorAll('.toolbar__item')).find(el => (el.getAttribute('aria-label')||'') === '发布到 GitHub');
if (!bar) return 'topbar not found';
bar.click();
return 'menu opened';
```
```javascript
const d = window.document;
const item = Array.from(d.querySelectorAll('.b3-menu__item')).find(it => (it.textContent||'').includes('发布当前笔记'));
if (!item) return 'publish item not found';
item.click();
return 'publish dialog triggered';
```
确认上传目录（默认即文档标题）并点「发布到 GitHub」：
```javascript
const d = window.document;
const input = d.querySelector('#fileNameInput');
const btn = d.querySelector('#publishBtn');
if (!btn) return 'publish button not found';
const folder = input ? input.value : null;
btn.click();
return { folder, clicked: true };
```
> 如需自定义上传目录名，先 `input.value = '目录名'` 并派发 `input` 事件，再点发布。

### 第 5 步：核对结果
- 过程提示顺序：导出笔记 → 处理图片 → 上传笔记 → 发布成功！
- 读取发布记录确认（只取 URL，不涉及 token）：用 `file` 工具读取 `data/storage/petal/siyuan-github-publish-plugin/github-publish-records.json`，取时间最新的一条。
- 把 `markdownUrl` 反馈给用户，形如：
  `https://github.com/<用户名>/<仓库>/blob/<分支>/<基础路径>/<目录>/index.md`
- 失败时的常见原因：Access Token 无 `repo` 权限 / 仓库不存在或无写权限 / 分支不存在 / 网络问题。

## 注意事项
- `repository` 是**全局配置**，修改后会影响之后所有发布；若针对不同文档要发到不同仓库，每次发布前按第 2–3 步重设。
- 仓库格式必须是 `用户名/仓库名`，不能有空格；插件校验正则只接受 `[a-zA-Z0-9_.-]`，**含中文或特殊字符的仓库名会校验失败**。
- 图片会与 `index.md` 放在同一目录（`image1.png`、`image2.jpg`…）。
- 发布是写入 `index.md`，同名目录会被覆盖更新，不会自动删除远端多余文件。
- 删除已发布内容需在插件菜单里用「删除发布」，本 Skill 不主动删除。
