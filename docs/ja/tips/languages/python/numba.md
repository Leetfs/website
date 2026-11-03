---
title: Numba
author: Lee
---

## 简介

通过 `@jit` 或 `@njit`，自动将的 Python 函数编译为高性能机器码。

## 安装

```bash
pip install numba
```

## 使用示例

```python{1,3}
from numba import njit

@njit
def add(a, b):
    return a + b

print(add(1, 2))  # 输出：3
```
