---
title: RISC-V GNU コンパイラツールチェーン
author: Lee
---

## 前提条件

本記事ではプリビルド版を使用します。ビルド自体をしたい場合は公式ドキュメントを参照してください。

## インストール編

- [releases](https://github.com/riscv-collab/riscv-gnu-toolchain/releases) ページで適切なパッケージを選択してください。
- ダウンロードしたファイルを `/opt` に解凍し、`/opt/riscv/bin` を `PATH` に追加してください。

```bash
curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz # ダウンロード

tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ # 解凍

rm /tmp/riscv64-toolchain.tar.xz # アーカイブを削除

export PATH=/opt/riscv/bin:$PATH # 環境変数の設定
```

以下のコマンドで正しくインストールされたかテストできます（以下は glibc ツールチェーン用。他のバージョンは公式ドキュメントを参照してください）。

```bash
riscv64-unknown-linux-gnu-gcc --version
riscv64-unknown-linux-gnu-g++ --version
riscv64-unknown-linux-gnu-gfortran --version
riscv64-unknown-linux-gnu-objdump --version
riscv64-unknown-linux-gnu-gdb --version
```

### docker でのインストール

dockerfile の利用を推奨します。

```dockerfile
# クロスコンパイラツールチェーンのダウンロードと展開
RUN curl -fL https://github.com/riscv-collab/riscv-gnu-toolchain/releases/download/2025.01.20/riscv64-glibc-ubuntu-22.04-gcc-nightly-2025.01.20-nightly.tar.xz -o /tmp/riscv64-toolchain.tar.xz && \
    tar -xf /tmp/riscv64-toolchain.tar.xz -C /opt/ && \
    rm /tmp/riscv64-toolchain.tar.xz

# クロスコンパイラツールチェーンパスの設定
ENV PATH=/opt/riscv/bin:$PATH
```

## 使い方編

このツールチェーンと cmake を利用することで RISC-V プログラムをクロスコンパイルできます。

- `toolchain-riscv64.cmake`（または好きな名前）を作成し、cmake のクロスコンパイル設定ファイルとします。
- `cmake -D CMAKE_TOOLCHAIN_FILE=ファイルパス/toolchain-riscv64.cmake` でこのファイルを指定してください。
- `make -j $(nproc)` を実行してバイナリを作成します。

こちらが私の `toolchain-riscv64.cmake` のサンプルです

```cmake
# クロスコンパイル対象のアーキテクチャ設定
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR riscv64)

# クロスコンパイラツールチェーンパス
set(tools /opt/riscv)

# C および C++ コンパイラの設定
set(CMAKE_C_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER ${tools}/bin/riscv64-unknown-linux-gnu-g++)

# sysroot の設定（ある場合）
set(CMAKE_SYSROOT /opt/riscv/sysroot)

# 検索パスの設定
set(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT})
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# 静的リンクの使用
set(CMAKE_EXE_LINKER_FLAGS "-static")
# set(CMAKE_CXX_FLAGS "-static -O3") #最適化を有効化
# set(CMAKE_C_FLAGS "-static -O3")
set(BUILD_SHARED_LIBS OFF)
```
