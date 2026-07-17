---
title: RISC-V GNU 编译器工具链
author: Lee
---

## 前置条件

本文章使用预编译版本，想自行编译请参考官方文档。

## 安装篇

- 前往 [releases](https://github.com/riscv-collab/riscv-gnu-toolchain/releases) 页面挑选合适的包。
- 将下载的文件解压到 `/opt`, 并把 `/opt/riscv/bin` 添加到 `PATH`。

```bash
curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz # 下载

tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ #解压

rm /tmp/riscv64-toolchain.tar.xz # 移除压缩包

export PATH=/opt/riscv/bin:$PATH # 设置环境变量
```

可使用以下命令测试是否正确安装（以下命令适用于 glibc 工具链，其余版本参照官方文档~）

```bash
riscv64-unknown-linux-gnu-gcc --version
riscv64-unknown-linux-gnu-g++ --version
riscv64-unknown-linux-gnu-gfortran --version
riscv64-unknown-linux-gnu-objdump --version
riscv64-unknown-linux-gnu-gdb --version
```

### 在 docker 里安装

推荐使用 dockerfile。

```dockerfile
# 下载并解压交叉编译工具链
RUN curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz && \
    tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ && \
    rm /tmp/riscv64-toolchain.tar.xz

# 设置交叉编译工具链路径
ENV PATH=/opt/riscv/bin:$PATH
```

## 使用篇

可以使用此工具链 + cmake 交叉编译 RISC-V 程序。

- 建一个 `toolchain-riscv64.cmake` （或你喜欢的名字） 作为 cmake 交叉编译配置文件。
- 使用 `cmake -D CMAKE_TOOLCHAIN_FILE=文件路径/toolchain-riscv64.cmake` 指定使用此文件。
- 运行 `make -j $(nproc)` make 出二进制程序。

以下是我的 `toolchain-riscv64.cmake` 样板

```cmake
# 设置交叉编译的目标架构
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR riscv64)

# 设置交叉编译工具链路径
set(tools /opt/riscv)

# 设置 C 和 C++ 编译器
set(CMAKE_C_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-g++)

# 设置 sysroot（如果有）
set(CMAKE_SYSROOT /opt/riscv/sysroot)

# 配置查找路径
set(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT})
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# 使用静态链接
set(CMAKE_EXE_LINKER_FLAGS "-static")
# set(CMAKE_CXX_FLAGS "-static -O3") #启用优化
# set(CMAKE_C_FLAGS "-static -O3")
set(BUILD_SHARED_LIBS OFF)
```
