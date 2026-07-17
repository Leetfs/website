---
title: 環境変数の永続化
author: Lee
---

## 設定

`.bashrc` を開く

```bash
nano ~/.bashrc
```

最後に `export` 文を追加する

```bash
export VENTUS_INSTALL_PREFIX=/root/J142/llvm-project/install
export SPIKE_TARGET_DIR=${VENTUS_INSTALL_PREFIX}
export LD_LIBRARY_PATH=${VENTUS_INSTALL_PREFIX}/lib
export OCL_ICD_VENDORS=${VENTUS_INSTALL_PREFIX}/lib/libpocl.so
export POCL_DEVICES=\"ventus\"
```
