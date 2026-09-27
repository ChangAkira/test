---
name: image
description: 查看、检索及分析思源文档引用的本地图片，或根据提示词生成图片资源。操作：list(列出文档图片), analyze(分析指定图片), generate(生成图片资源)
---

# image

查看、检索及分析思源文档引用的本地图片，或根据提示词生成图片资源。

## 操作列表

### 1. list - 列出文档中的图片
列出指定文档（或块所在文档）中引用的所有本地图片资源路径。

#### 参数
- `action`: `"list"`
- `documentID`: `string` (文档 ID 或其下属块 ID)

#### 示例
```json
{
  "action": "list",
  "documentID": "20260715130000-abcdefg"
}
```

---

### 2. analyze - 分析/阅读指定图片
加载并读取文档中引用的本地图片，传给视觉大模型进行识别与分析。

#### 参数
- `action`: `"analyze"`
- `documentID`: `string` (文档 ID)
- `assetPath`: `string` (由 list 返回的本地图片资源路径，如 `"assets/20260715130000-xxxx.png"`)
- `question`: `string` (可选，针对该图片的具体提问)
- `detail`: `"auto"` | `"low"` | `"high"` (可选，视觉识别精度)

#### 示例
```json
{
  "action": "analyze",
  "documentID": "20260715130000-abcdefg",
  "assetPath": "assets/20260715130000-xxxx.png",
  "question": "这张图片展示了什么内容？"
}
```

---

### 3. generate - 生成图片资源
根据提示词生成新的图片资源并存入目标笔记本。

#### 参数
- `action`: `"generate"`
- `documentID`: `string` (目标文档 ID)
- `prompt`: `string` (生成图片的提示词)
- `size`: `string` (可选，如 `"1024x1024"`)
- `quality`: `string` (可选)
- `outputFormat`: `"png"` | `"jpeg"` | `"webp"` (可选)

#### 示例
```json
{
  "action": "generate",
  "documentID": "20260715130000-abcdefg",
  "prompt": "一只可爱的卡通猫咪在草地上玩耍"
}
```
