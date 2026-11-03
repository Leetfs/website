---
title: Numba
author: Lee
---

## Introduction

Automatically compile Python functions into high-performance machine code using `@jit` or `@njit`.

## Installation

```bash
pip install numba
```

## Usage Example

```python{1,3}
from numba import njit

@njit
def add(a, b):
    return a + b

print(add(1, 2))  # Output: 3
```
