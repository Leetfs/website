---
title: lit を使って LLVM IR ファイルをテストする
author: Lee
---

## 用語マッチング

- lit: LLVM インテグレーテッド テスター
- .ll: LLVM IR ファイル

## 前提条件

llvm がインストール済み

## テスト手順

```yaml
float.ll
  |
  v
lit で RUN コマンド実行 -> llc で出力を生成
  |
  v
FileCheck で出力を検証
  |
  +--✔️ すべて一致：PASS
  |
  +--❌ エラーあり：FAIL
```

## 実行コマンド

特定のファイルやフォルダーを指定できます。

```bash
llvm-lit llvm/test/CodeGen/RISCV/VentusGPGPU/float.ll
```

## 出力

```bash
-- Testing: 1 tests, 1 workers --
PASS: LLVM :: CodeGen/RISCV/VentusGPGPU/float.ll (1 of 1)

Testing Time: 0.07s
  Passed: 1
```

## よく使うコマンド

| コマンド                      | 説明                                           | 例                                     |
| ------------------------- | -------------------------------------------- | ------------------------------------- |
| `llvm-lit <test_dir>`     | 指定したディレクトリ内のすべてのテストケースを実行                    | `llvm-lit ./test`                     |
| `-v` または `--verbose`      | 詳細なテスト出力を表示                                  | `llvm-lit -v ./test`                  |
| `-j <N>` または `--jobs=<N>` | 並列で実行するテスト数を指定                               | `llvm-lit -j 4 ./test`                |
| `--max-tests <N>`         | 最大テスト数の制限                                    | `llvm-lit --max-tests=100 ./test`     |
| `--filter=<pattern>`      | 指定したパターンに一致するテストを実行（テスト名によるフィルタリング）          | `llvm-lit --filter=xyz ./test`        |
| `--show-unsupported`      | サポートされていないテストを表示                             | `llvm-lit --show-unsupported ./test`  |
| `--test-messages`         | 各テストの詳細な出力を表示（標準出力と標準エラー出力を含む）               | `llvm-lit --test-messages ./test`     |
| `--help`                  | `llvm-lit` のヘルプドキュメントを表示し、すべての対応オプションや引数をリスト | `llvm-lit --help`                     |
| `--dump-input=help`       | テストが失敗した場合、入力の内容を表示して、失敗理由のデバッグを支援           | `llvm-lit --dump-input=help ./test`   |
| `--continue-on-error`     | どれかのテストが失敗しても、他のテストを継続実行し、テストプロセスを停止しない      | `llvm-lit --continue-on-error ./test` |
| `--output=<file>`         | テスト結果を指定ファイルに出力                              | `llvm-lit --output=result.txt ./test` |
| `--no-filecheck`          | `FileCheck` 出力の生成を無効化                        | `llvm-lit --no-filecheck ./test`      |
