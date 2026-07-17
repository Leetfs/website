---
title: Persist environment variables
author: Lee
---

## Configuration

Open `.bashrc`

```bash
nano ~/.bashrc
```

Add the `export` statements at the end

```bash
export VENTUS_INSTALL_PREFIX=/root/J142/llvm-project/install
export SPIKE_TARGET_DIR=${VENTUS_INSTALL_PREFIX}
export LD_LIBRARY_PATH=${VENTUS_INSTALL_PREFIX}/lib
export OCL_ICD_VENDORS=${VENTUS_INSTALL_PREFIX}/lib/libpocl.so
export POCL_DEVICES="ventus"
```
