---
title: Numba
author: Lee
---

## 概要

`@jit` または `@njit` を使って、Python関数を自動的に高性能なマシンコードにコンパイルできます。

## インストール

```bash
pip install numba
```

## 使用例

```python{1,3}
from numba import njit

@njit
def add(a, b):
    return a + b

print(add(1, 2))  # 出力：3
```
