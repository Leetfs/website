---
title: 安装 CUDA Toolkit
author: Lee
---

## 安装

前往[官网](https://developer.nvidia.com/cuda-downloads)挑选合适的包。

## 环境变量

```bash
export PATH=/usr/local/cuda-12.8/bin:$PATH
export CUDADIR=/usr/local/cuda-12.8
export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/cuda-12.8/lib64
export CPLUS_INCLUDE_PATH=$CPLUS_INCLUDE_PATH:/usr/local/cuda-12.8/include
```

## 测试安装状态

```bash
nvcc --version
```

### 返回

```text
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2025 NVIDIA Corporation
Built on Fri_Feb_21_20:23:50_PST_2025
Cuda compilation tools, release 12.8, V12.8.93
Build cuda_12.8.r12.8/compiler.35583870_0
```
