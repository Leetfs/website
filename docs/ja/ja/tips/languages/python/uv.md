---
title: uv パッケージマネージャー
author: Lee
---

## 概要

[uv](https://docs.astral.sh/uv/) は**次世代**の Python パッケージ管理ツールです

## インストール

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 仮想環境を作成

```bash
uv venv
```

## パッケージのインストール／アンインストール

pip コマンドの前に uv を追加

```bash
uv pip install triton
uv pip uninstall triton
```

## 依存パッケージの管理

### 依存パッケージのインストール／アンインストール

```bash
uv pip install requests
uv pip uninstall requests
```

### requirements.txt に従ってインストール

```bash
uv pip install -r requirements.txt
```

### 依存リストの凍結

```bash
uv pip freeze > requirements.txt
```

### すべての依存を更新

```bash
uv pip install -U -r requirements.txt
```

## Python スクリプトを実行

```bash
uv run script.py
```

## REPL を起動

```bash
uv
```

## キャッシュをクリア

```bash
uv cache clean
```
