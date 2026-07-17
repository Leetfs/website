---
title: RISC-V Zvfh(min) 拡張サポート調査報告書（LLVM CodeGen段階）
author: Lee
---

## 著作権声明

本記事は元々 [xlinsist/llvm-project Issue #2](https://github.com/xlinsist/llvm-project/issues/2) に掲載され、原作者は私自身です。元リポジトリのライセンス [Apache License 2.0](https://github.com/xlinsist/llvm-project/blob/main/LICENSE.TXT) に従っています。この内容をもとに、再編集して当ブログで公開します。

## 概要

### 調査目標

- ventus-llvmにZvfh(min)拡張サポートを追加する

### 開発背景

- Ventus 向けに半精度16ビットhalf浮動小数点データ型のサポート追加
- 本プロジェクトはhalf型の段階的なサポート（スカラ型（Zhinx(min)）およびベクトル型（Zvfh(min)））を目標とします
- Zhinx(min)拡張は基本的に動作し、現在PRのレビューおよび修正中です

### ニーズ分析

- half型はより低い精度と範囲を持ち、メモリ消費が少なくスループットが高いです

## 公式Zvfh(min)パッチまとめ

- パッチ先：[D151414](https://reviews.llvm.org/D151414)
- 対象ファイル：
  - `RISCVISAInfo.cpp`
  - `RISCVFeatures.td`
  - `RISCVISelLowering.cpp`
  - `RISCVInstrInfoVPseudos.td`
  - `RISCVInstrInfoVSDPatterns.td`
  - `RISCVInstrInfoVVLPatterns.td`
  - `RISCVSubtarget.h`
  - `**.ll`
- 主な変更点：
  - zvfhminの登録
  - f16用の型・命令の合法化処理を追加
  - f16に対する`vfwcvt.f.f.v` `vfncvt.f.f.w`命令の処理
  - 現在のデバイスがf16ベクトル命令に対応しているか判定
  - f16関連のSDNodeと機械命令のマッピング追加
  - テストケースの追加

## 変更ファイル

| ファイルパス                                                                           | 変更内容                                                                                                                 |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `llvm/lib/Support/RISCVISAInfo.cpp`                                              | zvfhmin命令セット拡張を拡張テーブルに登録                                                                                             |
| `llvm/lib/Target/RISCV/RISCV.td`                                                 | zvfhmin機能を追加し、依存zve32f `[FeatureStdExtZve32f]` をマッチ                                                                  |
| `llvm/lib/Target/RISCV/RISCVInstrInfoVPseudos.td & RISCVInstrInfoVSDPatterns.td` | Zvfh(min)命令とパターンの追加                                                                               |
| `llvm/lib/Target/RISCV/RISCVISelLowering.cpp`                                    | MVT::f16型と操作サポートを導入し、Zvfhminが有効な場合のみMVT::f16ベクトル型を許可 |
| `llvm/test/CodeGen/RISCV/VentusGPGPU/half.ll`                                    | テストケースの追加                                                                                                            |

## テストケース

| 種類   | 目的                | 例                              |
| ---- | ----------------- | ------------------------------ |
| 命令生成 | 半精度命令が正しく生成されるか検証 | `float.ll` を `half.ll` に書き換え   |
| 型変換  | halfとfloat32の変換   | `vfwcvt.f.f.v`, `vfncvt.f.f.w` |

## 補足

Zvfhminは変換（`vfwcvt.f.f.v f16=>f32`, `vfncvt.f.f.w f32=>16`）のみサポートし、半精度ベクトル算術演算は直接サポートしません。算術演算にはzvfhが必要です。
