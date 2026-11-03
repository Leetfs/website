---
title: Triton 使用体验与性能分析
author: Lee
---

## 概述

Triton 是为深度学习优化的 GPGPU 编程框架，**简洁、高性能**，使用 python 环境高效编写~

## 安装及使用

使用 pip。

```bash
uv pip install triton
```

```python
import triton

@triton.jit
...
```

## 性能优化

### 调整线程块大小

#### vecadd: BLOCK_SIZE = 16

![](/tips/gpgpu/images/trition-report/vector-add-performance-16.png)

#### vecadd: BLOCK_SIZE = 32

![](/tips/gpgpu/images/trition-report/vector-add-performance-32.png)
