---
title: Triton の使用体験とパフォーマンス分析
author: Lee
---

## 概要

Triton はディープラーニングのために最適化された GPGPU プログラミングフレームワークで、**シンプルかつ高性能**、Python 環境で効率的に記述できます。

## インストールおよび使用方法

pip を使用します。

```bash
uv pip install triton
```

```python
import triton

@triton.jit
...
```

## パフォーマンス最適化

### スレッドブロックサイズの調整

#### vecadd: BLOCK_SIZE = 16

![](/tips/gpgpu/images/trition-report/vector-add-performance-16.png)

#### vecadd: BLOCK_SIZE = 32

![](/tips/gpgpu/images/trition-report/vector-add-performance-32.png)
