---
title: RISC-V GNU Compiler Toolchain
author: Lee
---

## Prerequisites

This article uses the precompiled version. If you want to build it yourself, please refer to the official documentation.

## Installation

- Go to the [releases](https://github.com/riscv-collab/riscv-gnu-toolchain/releases) page and select a suitable package.
- Extract the downloaded file to `/opt`, and add `/opt/riscv/bin` to `PATH`.

```bash
curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz # Download

tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ #Extract

rm /tmp/riscv64-toolchain.tar.xz # Remove archive

export PATH=/opt/riscv/bin:$PATH # Set environment variable
```

You can use the following commands to test if the installation is correct (the following commands are for the glibc toolchain; refer to the documentation for other versions).

```bash
riscv64-unknown-linux-gnu-gcc --version
riscv64-unknown-linux-gnu-g++ --version
riscv64-unknown-linux-gnu-gfortran --version
riscv64-unknown-linux-gnu-objdump --version
riscv64-unknown-linux-gnu-gdb --version
```

### Installation in Docker

It is recommended to use a Dockerfile.

```dockerfile
# Download and extract the cross-compilation toolchain
RUN curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz && \
    tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ && \
    rm /tmp/riscv64-toolchain.tar.xz

# Set cross-compilation toolchain path
ENV PATH=/opt/riscv/bin:$PATH
```

## Usage

You can use this toolchain with cmake to cross-compile RISC-V programs.

- Create a `toolchain-riscv64.cmake` (or any name you prefer) file as the CMake cross-compilation configuration file.
- Use `cmake -D CMAKE_TOOLCHAIN_FILE=path/to/toolchain-riscv64.cmake` to specify this file.
- Run `make -j $(nproc)` to build the binary program.

Below is my `toolchain-riscv64.cmake` template

```cmake
# Set the target architecture for cross compilation
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR riscv64)

# Set the path to the cross-compilation toolchain
set(tools /opt/riscv)

# Set the C and C++ compilers
set(CMAKE_C_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-g++)

# Set sysroot (if any)
set(CMAKE_SYSROOT /opt/riscv/sysroot)

# Configure search paths
set(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT})
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# Use static linking
set(CMAKE_EXE_LINKER_FLAGS "-static")
# set(CMAKE_CXX_FLAGS "-static -O3") #Enable optimization
# set(CMAKE_C_FLAGS "-static -O3")
set(BUILD_SHARED_LIBS OFF)
```
