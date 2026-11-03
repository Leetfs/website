---
title: uv 包管理器
author: Lee
---

## 简介

[uv](https://docs.astral.sh/uv/) 是**新一代** Python 包管理工具

## 安装

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 创建虚拟环境

```bash
uv venv
```

## 安装/卸载包

在 pip 命令前 + uv

```bash
uv pip install triton
uv pip uninstall triton
```

## 管理依赖包

### 安装/卸载依赖包

```bash
uv pip install requests
uv pip uninstall requests
```

### 按 requirements.txt 安装

```bash
uv pip install -r requirements.txt
```

### 冻结依赖列表

```bash
uv pip freeze > requirements.txt
```

### 更新所有依赖

```bash
uv pip install -U -r requirements.txt
```

## 运行 Python 脚本

```bash
uv run script.py
```

## 启动 REPL

```bash
uv
```

## 清理缓存

```bash
uv cache clean
```
