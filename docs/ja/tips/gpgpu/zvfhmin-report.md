---
title: RISC-V Zvfh(min) 扩展支持调研报告（LLVM CodeGen阶段）
author: Lee
---

## 版权声明

本文最初发表于 [xlinsist/llvm-project Issue #2](https://github.com/xlinsist/llvm-project/issues/2)，原作者为本人。遵循原仓库许可证 [Apache License 2.0](https://github.com/xlinsist/llvm-project/blob/main/LICENSE.TXT)。在此基础上，转载并稍作整理发布于本博客。

## 概述

### 调研目标

- 在 ventus-llvm 中添加对 Zvfh(min) 扩展的支持

### 开发背景

- 为承影添加对半精度16位half浮点数据类型的支持
- 项目目标是逐步支持 half 类型，包括标量（Zhinx(min)）和向量（Zvfh(min)
- Zhinx(min)扩展已初步打通，正在PR review和修改阶段

### 需求分析

- half 具有更低的精度和范围，具备更小的内存占用和更高的吞吐率

## 官方 Zvfh(min) Patch 总结

- Patch 地址：[D151414](https://reviews.llvm.org/D151414)
- 涉及文件：
  - `RISCVISAInfo.cpp`
  - `RISCVFeatures.td`
  - `RISCVISelLowering.cpp`
  - `RISCVInstrInfoVPseudos.td`
  - `RISCVInstrInfoVSDPatterns.td`
  - `RISCVInstrInfoVVLPatterns.td`
  - `RISCVSubtarget.h`
  - `**.ll`
- 主要修改内容：
  - 注册 zvfhmin
  - 为 f16 添加类型/指令合法化处理
  - 处理 f16 下 `vfwcvt.f.f.v` `vfncvt.f.f.w` 指令
  - 判断当前设备是否支持 f16 向量指令
  - 添加与 f16 相关的 SDNode 与机器指令映射
  - 添加测试用例

## 修改文件

| 文件路径                                                                             | 修改目标                                                                                                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `llvm/lib/Support/RISCVISAInfo.cpp`                                              | 把 zvfhmin 指令集扩展注册进扩展表                                                                                                  |
| `llvm/lib/Target/RISCV/RISCV.td`                                                 | 添加 zvfhmin 特性并匹配依赖 zve32f `[FeatureStdExtZve32f]`                                                                      |
| `llvm/lib/Target/RISCV/RISCVInstrInfoVPseudos.td & RISCVInstrInfoVSDPatterns.td` | 添加 Zvfh(min) 指令及匹配 Pattern                                                                          |
| `llvm/lib/Target/RISCV/RISCVISelLowering.cpp`                                    | 引入 MVT::f16 类型及操作支持，确保只有启用 Zvfhmin 时才允许 MVT::f16 向量类型​ |
| `llvm/test/CodeGen/RISCV/VentusGPGPU/half.ll`                                    | 添加测试用例                                                                                                                 |

## 测试用例

| 类型   | 目的                 | 示例                             |
| ---- | ------------------ | ------------------------------ |
| 指令生成 | 验证半精度指令是否被正确生成     | 改写 `float.ll` 为 `half.ll`      |
| 类型转换 | half 与 float32 的转换 | `vfwcvt.f.f.v`, `vfncvt.f.f.w` |

## 补充

Zvfhmin 只支持转换(`vfwcvt.f.f.v f16=>f32`, `vfncvt.f.f.w f32=>16`)，不能直接进行半精度的向量算术操作，如需算术运算，需使用zvfh。
