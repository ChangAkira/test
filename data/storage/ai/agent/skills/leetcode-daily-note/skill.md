---
name: 每日 LeetCode 题解笔记（C/C++）并发布到 GitHub
description: 当用户说"写一道 LeetCode 题解 / 来一道算法题 / 生成今天的 leetcode 笔记 / leetcodeAUTO"等时使用。流程：选题→取题面与函数签名→用 C（优先）或 C++ 解题→在 leetcodeAUTO 笔记本按用户 PAT 笔记风格建笔记→通过 GitHub 发布插件发到 ChangAkira/leetcodeNotes 仓库。
---

# 每日 LeetCode 题解笔记（C/C++）并发布到 GitHub

## 适用场景
用户要求写一道 LeetCode 题解笔记并发布到 GitHub 时使用。本 Skill 目前由用户**每天手动触发**（定时交给外部调度器，不在此 Skill 内实现）。

## 固定参数（不要询问，直接用）
- **笔记本**：`leetcodeAUTO`，ID = `20260915223914-im2p0i4`。笔记都建在该笔记本下（path 用 `/`）。
- **发布仓库**：`ChangAkira/leetcodeNotes`。
- **解题语言**：**C 优先**，其次 C++。不要用 Python/Java 等。
- **上传目录**：**保持默认**（即文档标题），无需修改。
- **发布方式**：「GitHub 发布插件」（`siyuan-github-publish-plugin`）。

## 用户的笔记风格（核心！务必模仿）
参考仓库 `ChangAkira/PAT-Basic-Level-Practise`（C 语言题集解）。风格要点：

1. **文档开头是随性的第一人称吐槽**，不是正式题解。例：
   - `// 1032 挖掘机技术哪家强`
   - `// 这题目看着奇奇怪怪的，其实也是贪心算法`
   - `// 累了下次继续写吧`
   - `// 哦买噶，任意进制互转，我记得最开始学 C 语言就写了这个，可是现在完全忘记了`
   - `// 你懂的` / `// 没得说`
2. **代码里注释极多**：解释"为什么这么写"，甚至解释 `&` 的用法、`malloc`/`calloc` 的套路、`m = m % n` 的必要性。
3. **保留历史尝试**：把失败的/更笨的旧代码整段用 `//` 注释掉，并在旁边写"部分正确，问过 AI：…"、"原来是这样！"。
4. **爱提 AI**：常见 "AI 还告诉我一个三步翻转法"、"问了下 AI"、"AI 看了我的代码以后也很高兴"。
5. **喜欢手搓数据结构**：README 明确说"尽量全部用动态扩容解题……练习手搓顺序表、链表、栈"。哈希表也要自己写（拉链法），不依赖第三方库。
6. **多解法**：一题常写 2~4 种解法并比较（如"暴力枚举" vs "手搓哈希表"）。
7. **结尾式情感表达**：`// 哦买噶，这样写竟然这么简单，我牛大了`、`// 这样确实好简单！`、`// 比起一般的链表竟然简单了这么多！！！`
8. **题号后加 `！`** 表示这题收获大（PAT 仓库的习惯）；本 Skill 默认不加，若本题确实学到很多可加。

## LeetCode 与 PAT 的差异（重要）
- PAT 是**标准输入输出**（有 `main()`）；LeetCode 是**核心代码模式**，只需实现指定函数（如 `int* twoSum(int* nums, int numsSize, int target, int* returnSize)`），力扣会自动包含 `stdlib.h` 等头文件。
- 因此主代码写成 **LeetCode 提交用的函数形式**（签名必须与题目一致）；再**额外**补一个可本地运行的 `main()` 驱动版本（贴合用户"写完整程序"的习惯），用注释说明这是为本地调试。

## 工作流

### 第 1 步：确定今天的题目（避免重复）
1. 查该笔记本已有的题：
   ```sql
   SELECT id, content FROM blocks
   WHERE box='20260915223914-im2p0i4' AND type='d'
   ORDER BY content
   ```
   从文档标题解析出已写的 LeetCode 题号集合（标题形如 `LeetCode 1. 两数之和`）。
2. 选题规则：
   - 用户指定了题目（题号/题名/链接）→ **以用户指定为准**。
   - 否则按题号升序补缺：从 1 开始找第一个缺失的题号；1..N 都写过就取最大 +1。难度优先 Easy/Medium。
3. 得到 `titleSlug`（如 `two-sum`）。若只给了中文题名，可先用 `https://leetcode.com/api/problems/all/`（纯 JSON，通常可匿名访问）反查 `question__title_slug`。

### 第 2 步：抓取题面 + 函数签名（先国内站，进不去再换 GraphQL）
**顺序很重要：先试国内 leetcode.cn，进不去再换 leetcode.com 的 GraphQL。**

**① 首选：国内站 leetcode.cn 的 GraphQL**
```
POST https://leetcode.cn/graphql/
Content-Type: application/json
Referer: https://leetcode.cn/
User-Agent: <常见浏览器 UA>

{
  "query": "query q($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId translatedTitle difficulty translatedContent topicTags { translatedName } codeSnippets { lang langSlug code } } }",
  "variables": { "titleSlug": "two-sum" }
}
```
- 取 `questionFrontendId`（题号）、`translatedTitle`（中文题名）、`translatedContent`（中文题面）、`difficulty`、`topicTags.translatedName`、以及 `codeSnippets` 中 `langSlug == "c"`（或 `"cpp"`）的 `code`（**这就是 C 的函数签名，直接用**）。

**② 判据：如果国内站进不去，就换 GraphQL（leetcode.com）**
出现下列任一情况即认定为"国内站进不去"，**不要纠缠，立刻切到 ②**：
- 返回 **403** 且页面是 Cloudflare 挑战页（标题 `Just a moment...`）；
- 连接超时 / `网络连接失败` / 返回空；
- 注意：这**可能是用户开了本地代理**导致国内站被拦，**不代表题目不存在**，不要因此放弃或去问用户。

**③ 备用：leetcode.com 的 GraphQL（实测可用）**
```
POST https://leetcode.com/graphql/
Content-Type: application/json
Referer: https://leetcode.com/problems/<titleSlug>/
User-Agent: <常见浏览器 UA>

{
  "query": "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId title difficulty content topicTags { name slug } codeSnippets { lang langSlug code } } }",
  "variables": { "titleSlug": "two-sum" }
}
```
- 返回英文题面 `content`（HTML）与 `codeSnippets`，其中 `langSlug == "c"` 的 `code` 就是 C 函数签名（如 `int* twoSum(int* nums, int numsSize, int target, int* returnSize)`），**签名直接用**。
- 因为是英文，**需要自己把题面/标题译成中文**再写笔记：标题用常见中文译名（如 `Two Sum` → `两数之和`），`topicTags` 也译为中文（`Array`→数组、`Hash Table`→哈希表、`Dynamic Programming`→动态规划…）。
- 提示：题目列表可用 `https://leetcode.com/api/problems/all/`（含 `frontend_question_id`、`question__title_slug`、`difficulty.level`）。

**④ 全都不行**：用 `web_fetch` 抓 `https://leetcode.cn/problems/<titleSlug>/description/`；若仍失败，**停下来请用户贴题面**，绝不编造题目/示例/测试数据。

### 第 3 步：解题并写代码
- 用 **C** 写；若 C 明显不适配（需 STL/类/复杂容器），改用 **C++**。
- 签名严格对齐第 2 步拿到的 C 模板。
- 写完先自己推演样例确保正确；本地若无法编译运行，**不要假装运行或通过**，如实说明。
- 至少给两种思路时更贴合用户习惯（例如"暴力枚举" + "手搓哈希表"），并在 `## 踩坑与收获` 记录边界条件与新知。

### 第 4 步：在 leetcodeAUTO 笔记本创建笔记
用 document 工具创建（notebook = `20260915223914-im2p0i4`，path = `/`）：
- **标题**：`LeetCode <题号>. <中文题目名>`（例：`LeetCode 1. 两数之和`）。标题不能含 `/`。
  - 上传目录名会自动等于这个标题，**不用改**。
- **markdown**：严格按下方模板。

### 第 5 步：发布到 GitHub
1. **确保目标文档是当前激活的标签页**：新创建的文档通常已作为一个标签打开（例如标题为 `LeetCode 1. 两数之和`）。若不是激活状态，点击对应标签页激活它（凭标签文字匹配即可）：
   ```javascript
   const d = window.document;
   const tab = Array.from(d.querySelectorAll('.layout-tab-bar .item')).find(it => (it.textContent||'').includes('LeetCode 1'));
   if (!tab) return 'tab not found';
   tab.click();
   return 'activated';
   ```
2. **把插件仓库地址改成 `ChangAkira/leetcodeNotes`**（插件仓库地址是全局配置，上次可能指向别的仓库，每次发布前都要确认/切换）。
3. **触发「发布当前笔记」→ 点发布按钮**。上传目录**保持默认，不要改**。
4. 读取 `data/storage/petal/siyuan-github-publish-plugin/github-publish-records.json`，取本次 noteId 对应的 `markdownUrl` 反馈用户。

Run_JS 步骤（DOM 选择器，已实测）：

```javascript
// A) 打开顶栏「发布到 GitHub」菜单
const d = window.document;
const bar = Array.from(d.querySelectorAll('.toolbar__item')).find(el => (el.getAttribute('aria-label')||'') === '发布到 GitHub');
if (!bar) return 'topbar not found';
bar.click();
// 菜单项：发布当前笔记 / 插件设置 / 使用帮助 / 问题反馈
```
```javascript
// B) 点「插件设置」
const d = window.document;
const item = Array.from(d.querySelectorAll('.b3-menu__item')).find(it => (it.textContent||'').includes('插件设置'));
if (!item) return 'settings item not found';
item.click();
```
```javascript
// C) 设置「仓库地址」为 ChangAkira/leetcodeNotes
//    设置项 label 文本为「仓库地址」，输入框是 .b3-label 内的 input.b3-text-field
const d = window.document;
const dlg = d.querySelector('.b3-dialog');
const label = Array.from(dlg.querySelectorAll('.b3-label')).find(l => l.textContent.includes('仓库地址'));
const input = label && label.querySelector('input.b3-text-field');
if (!input) return 'repo input not found';
input.value = 'ChangAkira/leetcodeNotes';
input.dispatchEvent(new Event('input', { bubbles: true }));
input.dispatchEvent(new Event('change', { bubbles: true }));
return input.value;
```
```javascript
// D) 点「保存」，再点「取消」关窗（取消不会回滚已保存内容）
const d = window.document;
const dlg = d.querySelector('.b3-dialog');
const save = Array.from(dlg.querySelectorAll('button')).find(b => b.textContent.trim() === '保存');
if (!save) return 'save button not found';
save.click();
const cancel = Array.from(dlg.querySelectorAll('button')).find(b => b.textContent.trim() === '取消');
if (cancel) cancel.click();
return 'saved';
```
```javascript
// E) 再次打开菜单，点「发布当前笔记」
const d = window.document;
const bar = Array.from(d.querySelectorAll('.toolbar__item')).find(el => (el.getAttribute('aria-label')||'') === '发布到 GitHub');
bar.click();
```
```javascript
// F) 点「发布当前笔记」后会出现发布弹窗（内含 #fileNameInput 上传目录 + #publishBtn）
const d = window.document;
const item = Array.from(d.querySelectorAll('.b3-menu__item')).find(it => (it.textContent||'').includes('发布当前笔记'));
if (!item) return 'publish item not found';
item.click();
return 'publish dialog triggered';
```
```javascript
// G) 直接点发布按钮。上传目录默认就是文档标题，无需修改
const d = window.document;
const btn = d.querySelector('#publishBtn');
if (!btn) return 'publish button not found';
btn.click();
return 'publishing';
```
> 发布过程界面会依次提示：导出笔记 → 处理图片 → 上传笔记 → 发布成功。完成后用 file 工具读发布记录核对 `markdownUrl`。

## 笔记格式模板

````markdown
> 难度：<Easy/Medium/Hard>　标签：<tag1、tag2>　链接：https://leetcode.cn/problems/<titleSlug>/

## 题目

<口语化复述题意 2~3 句 + 列出关键约束 + 给出 1~2 个输入输出示例>

## 思路

<第一人称、口语化地讲怎么想出来的：先想到什么、哪里卡住、怎么绕过去；可写"第一反应是…但…">
- 关键点：<1~2 条核心洞察>
- 复杂度：时间 O(...)，空间 O(...)

## 代码（C）

### 解法一：<名字，如在解法后写"（好想，但慢）">

```c
// LeetCode <题号> <中文题目名>
// <一句吐槽，口语化>
// 思路：<扼要说明>

<与题目一致的函数，行内注释拉满，解释为什么这么写>
```

### 解法二：<名字，如"手搓哈希表（O(n)）">

```c
// <说明为什么需要新方法，再给代码，注释拉满>
```

## 本地想自己跑一下

```c
// 本地调试用的 main，力扣提交时不需要这段
<完整可编译程序：把解答函数 + main 合起来>
```

## 踩坑与收获

- <本题踩的坑、边界条件；若学到新东西可写"原来是这样！""我牛大了">
- <可记"AI 还告诉我…""问了下 AI…"这类新认知；可写"以前从没注意过…"这类反思>
````

## 注意事项
- **严守语言要求**：只写 C（优先）或 C++。
- 题面/示例/函数签名**必须来自真实抓取**，不得编造；抓不到就问用户要。
- **国内站 403/超时不要慌**：很可能是用户本地代理导致，直接切 leetcode.com GraphQL（见第 2 步 ③），并按英文题面自行翻译成中文笔记。
- **上传目录保持默认**（=文档标题），不要修改。
- 创建笔记用 document 工具（勿手改笔记本文件）；发布只走插件 UI，**不要**用 file 工具直接改 `github-publish-config.json`（插件在内存缓存配置，直接改不生效）。
- **安全**：插件设置里的 GitHub Access Token 是敏感信息，**绝不输出、不回显、不写入笔记**；读取设置项时跳过 token 字段；注意该插件的设置/发布弹窗里 token 输入框是明文显示的，回报结果时不要带出它的值。
- 仓库名必须是 `用户名/仓库名` 且只含 `[a-zA-Z0-9_.-]`；`ChangAkira/leetcodeNotes` 合法。
- 每次发布都**先确认/切换仓库再发布**（仓库地址是全局配置）。
- 若用户当次指定了别的题目/仓库/语言，以用户当次要求为准。
