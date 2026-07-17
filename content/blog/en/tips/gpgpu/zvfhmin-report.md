---
title: RISC-V Zvfh(min) Extension Support Research Report (LLVM CodeGen Phase)
author: Lee
---

## Copyright Notice

This article was originally published at [xlinsist/llvm-project Issue #2](https://github.com/xlinsist/llvm-project/issues/2) by myself as the original author.Follows the original repository license [Apache License 2.0](https://github.com/xlinsist/llvm-project/blob/main/LICENSE.TXT).Based on this, it is reposted and slightly revised on this blog.

## Overview

### Research Goals

- Add support for the Zvfh(min) extension in ventus-llvm

### Development Background

- Add support for 16-bit half-precision floating-point data type to Chengying
- The project goal is to gradually support the half type, including scalar (Zhinx(min)) and vector (Zvfh(min))
- The Zhinx(min) extension has completed initial integration and is under PR review and revision stages

### Requirement Analysis

- Half has lower precision and range, and offers smaller memory usage and higher throughput

## Official Zvfh(min) Patch Summary

- Patch address: [D151414](https://reviews.llvm.org/D151414)
- Related files:
  - `RISCVISAInfo.cpp`
  - `RISCVFeatures.td`
  - `RISCVISelLowering.cpp`
  - `RISCVInstrInfoVPseudos.td`
  - `RISCVInstrInfoVSDPatterns.td`
  - `RISCVInstrInfoVVLPatterns.td`
  - `RISCVSubtarget.h`
  - `**.ll`
- Main modifications:
  - Register zvfhmin
  - Add type/instruction legalization for f16
  - Handle `vfwcvt.f.f.v` and `vfncvt.f.f.w` instructions for f16
  - Determine whether the current device supports f16 vector instructions
  - Add SDNode and machine instruction mapping related to f16
  - Add test cases

## File modifications

| File Path                                                                        | Modification Target                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `llvm/lib/Support/RISCVISAInfo.cpp`                                              | Register the zvfhmin instruction set extension into the extension table                                                                                                                   |
| `llvm/lib/Target/RISCV/RISCV.td`                                                 | Add the zvfhmin feature and match dependency zve32f `[FeatureStdExtZve32f]`                                                                                                               |
| `llvm/lib/Target/RISCV/RISCVInstrInfoVPseudos.td & RISCVInstrInfoVSDPatterns.td` | Add Zvfh(min) instructions and matching Patterns                                                                                                                       |
| `llvm/lib/Target/RISCV/RISCVISelLowering.cpp`                                    | Introduce MVT::f16 type and operation support, ensure that MVT::f16 vector types are only allowed when Zvfhmin is enabled |
| `llvm/test/CodeGen/RISCV/VentusGPGPU/half.ll`                                    | Add test cases                                                                                                                                                                            |

## Test Cases

| Type                   | Purpose                                                            | Example                         |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------- |
| Instruction Generation | Verify whether half-precision instructions are generated correctly | Rewrite `float.ll` to `half.ll` |
| Type Conversion        | Conversion between half and float32                                | `vfwcvt.f.f.v`, `vfncvt.f.f.w`  |

## Supplement

Zvfhmin only supports conversion (`vfwcvt.f.f.v f16=>f32`, `vfncvt.f.f.w f32=>16`) and does not support direct half-precision vector arithmetic operations. For arithmetic operations, zvfh is required.
