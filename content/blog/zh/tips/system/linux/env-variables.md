---
title: 持久化环境变量
author: Lee
---

## 配置

打开 `.bashrc`

```bash
nano ~/.bashrc
```

在最后面加上 `export` 语句

```bash
export VENTUS_INSTALL_PREFIX=/root/J142/llvm-project/install
export SPIKE_TARGET_DIR=${VENTUS_INSTALL_PREFIX}
export LD_LIBRARY_PATH=${VENTUS_INSTALL_PREFIX}/lib
export OCL_ICD_VENDORS=${VENTUS_INSTALL_PREFIX}/lib/libpocl.so
export POCL_DEVICES="ventus"
```
