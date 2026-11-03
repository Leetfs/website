---
title: Triton Usage Experience and Performance Analysis
author: Lee
---

## Overview

Triton is a GPGPU programming framework optimized for deep learning. **Simple and high-performance**, efficiently developed using the Python environment~

## Installation and Usage

Use pip.

```bash
uv pip install triton
```

```python
import triton

@triton.jit
...
```

## Performance Optimization

### Adjust Thread Block Size

#### vecadd: BLOCK_SIZE = 16

![](/tips/gpgpu/images/trition-report/vector-add-performance-16.png)

#### vecadd: BLOCK_SIZE = 32

![](/tips/gpgpu/images/trition-report/vector-add-performance-32.png)
