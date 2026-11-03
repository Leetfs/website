---
title: uv package manager
author: Lee
---

## Introduction

[uv](https://docs.astral.sh/uv/) is a **next-generation** Python package management tool

## Installation

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Create a virtual environment

```bash
uv venv
```

## Install/Uninstall packages

Add uv before the pip command

```bash
uv pip install triton
uv pip uninstall triton
```

## Manage dependencies

### Install/Uninstall dependencies

```bash
uv pip install requests
uv pip uninstall requests
```

### Install from requirements.txt

```bash
uv pip install -r requirements.txt
```

### Freeze dependency list

```bash
uv pip freeze > requirements.txt
```

### Update all dependencies

```bash
uv pip install -U -r requirements.txt
```

## Run Python script

```bash
uv run script.py
```

## Start REPL

```bash
uv
```

## Clean cache

```bash
uv cache clean
```
