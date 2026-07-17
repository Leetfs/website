---
title: Ventus GPGPU LLVM コンパイラのインストールメモ
author: Lee
---

## 概要

Ventus GPGPU は**RISC-V 向けの GPGPU** アーキテクチャです。\
本記事はこのリポジトリを参考にしています：<https://github.com/THU-DSP-LAB/llvm-project>。

## 依存関係のインストール

```bash
sudo apt install -y git build-essential clang cmake ninja-build ccache zlib1g-dev libtool autoconf automake device-tree-compiler bsdmainutils ruby clinfo
```

## ファイルのダウンロード

:::tip
フォルダを作成し、全てのリポジトリをそのディレクトリにクローンします。ここではファイル名を `J142` とします。
:::

- llvm-ventus : `git clone https://github.com/THU-DSP-LAB/llvm-project.git`
- pocl : `git clone https://github.com/THU-DSP-LAB/pocl.git`
- ocl-icd : `git clone https://github.com/OCL-dev/ocl-icd.git`
- isa-simulator(spike) : `git clone https://github.com/THU-DSP-LAB/ventus-gpgpu-isa-simulator.git`
- driver : `git clone https://github.com/THU-DSP-LAB/ventus-driver.git`
- rodinia : `git clone https://github.com/THU-DSP-LAB/gpu-rodinia.git`

## 環境変数の設定

```bash
export VENTUS_INSTALL_PREFIX=/root/J142/llvm-project/install
export SPIKE_TARGET_DIR=${VENTUS_INSTALL_PREFIX}
export LD_LIBRARY_PATH=${VENTUS_INSTALL_PREFIX}/lib
export OCL_ICD_VENDORS=${VENTUS_INSTALL_PREFIX}/lib/libpocl.so
export POCL_DEVICES="ventus"
export PATH=/root/J142/llvm-project/build/bin:$PATH
export BUILD_TYPE=Debug
```

## コンパイラのビルド

```bash
cd J142/llvm-project
./build-ventus.sh
```

## インストール状況の確認

```bash
cd J142/pocl/build/bin
./poclcc -l
```

![](/tips/gpgpu/images/llvm-img/poclcc.png)

## テストケースの実行

```bash
cd J142/pocl/build/examples/vecadd
./vecadd
```

![](/tips/gpgpu/images/llvm-img/vecadd.png)
