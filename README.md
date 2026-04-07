<div align="center">
  <img src="apps/reader-app/src-tauri/icons/icon.png" alt="Reader Logo" width="20%" />
  <h1>Reader</h1>
</div>

Reader 是一个开源电子书阅读器，基于 Readest 项目进行二次开发与维护。  
本项目在继承原有阅读能力的基础上，新增了自定义壁纸功能，用于书库背景的个性化设置。

## 版权与来源说明

为避免版权误解，请注意以下信息：

1. Reader 是基于 Readest 的修改版本，不是独立从零实现的全新项目。
2. 本项目遵循并保留原项目相关开源许可证与版权要求。
3. 本项目当前重点新增能力为“自定义壁纸功能”，包含背景图设置、透明度、模糊度与缩放方式调节。

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 多格式支持 | 支持 EPUB、MOBI、KF8(AZW3)、FB2、CBZ、TXT、PDF |
| 阅读模式 | 支持滚动与翻页模式切换 |
| 标注能力 | 支持高亮、书签、笔记 |
| 书库管理 | 支持书籍整理、排序、搜索 |
| 跨平台 | 支持 macOS、Windows、Linux、Android、iOS、Web |
| 自定义壁纸 | 可为书库设置个性化背景图，支持透明度、模糊度、缩放调节 |

## 快速开始

以下命令在仓库根目录执行。

### 1. 克隆仓库

```bash
git clone <your-reader-repo-url> reader
cd reader
```

### 2. 安装依赖

```bash
git submodule update --init --recursive
pnpm install
pnpm --filter @reader/reader-app setup-vendors
```

### 3. 启动开发

```bash
# 桌面应用（Tauri）
pnpm tauri dev

# Web 应用
pnpm dev-web
```

### 4. 构建发布

```bash
pnpm tauri build
pnpm tauri android build
pnpm tauri ios build
```

## 常用命令

```bash
# 单元测试
pnpm test

# 前端检查
pnpm --filter @reader/reader-app lint

# 格式化检查
pnpm format:check
```

## 截图



## 许可证

本项目采用 AGPL-3.0 许可证。详细条款见 [LICENSE](LICENSE)。

## 第三方组件说明

本项目使用了多个开源组件，包括但不限于：

- foliate-js
- zip.js
- fflate
- PDF.js
- daisyUI
- marked
- Next.js
- React
- Tauri

相关组件的许可证信息请以各组件随附声明和本仓库文件为准。
