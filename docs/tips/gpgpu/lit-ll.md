---
title: 使用 lit 测试 LLVM IR 文件
author: Lee
---

## 术语匹配

- lit: LLVM Integrated Tester
- .ll: LLVM IR 文件

## 前置条件

已安装 llvm

## 测试流程

```yaml
float.ll
  |
  v
lit 执行 RUN 指令 -> llc 生成输出
  |
  v
FileCheck 校验输出
  |
  +--✔️ 全部匹配：PASS
  |
  +--❌ 有错：FAIL
```

## 执行语句

可指定某一文件，也可指定某文件夹。

```bash
llvm-lit llvm/test/CodeGen/RISCV/VentusGPGPU/float.ll
```

## 输出

```bash
-- Testing: 1 tests, 1 workers --
PASS: LLVM :: CodeGen/RISCV/VentusGPGPU/float.ll (1 of 1)

Testing Time: 0.07s
  Passed: 1
```

## 常用指令

| 指令                          | 描述                                                         | 示例                                                       |
|-------------------------------|--------------------------------------------------------------|------------------------------------------------------------|
| `llvm-lit <test_dir>`           | 执行指定目录下的所有测试用例                                 | `llvm-lit ./test`                                           |
| `-v` 或 `--verbose`            | 显示详细的测试输出信息                                       | `llvm-lit -v ./test`                                        |
| `-j <N>` 或 `--jobs=<N>`       | 指定并行运行的测试数                                         | `llvm-lit -j 4 ./test`                                      |
| `--max-tests <N>`              | 限制最多执行的测试数量                                       | `llvm-lit --max-tests=100 ./test`                           |
| `--filter=<pattern>`           | 运行符合给定模式的测试（根据测试名称过滤）                   | `llvm-lit --filter=xyz ./test`                              |
| `--show-unsupported`           | 显示不支持的测试                                              | `llvm-lit --show-unsupported ./test`                        |
| `--test-messages`              | 显示每个测试的详细输出信息（包括标准输出和错误输出）         | `llvm-lit --test-messages ./test`                           |
| `--help`                       | 显示 `llvm-lit` 的帮助文档，列出所有支持的选项和参数           | `llvm-lit --help`                                           |
| `--dump-input=help`            | 如果测试失败，显示输入的内容，帮助调试失败原因               | `llvm-lit --dump-input=help ./test`                         |
| `--continue-on-error`          | 如果某个测试失败，继续执行其他测试，不停止测试过程           | `llvm-lit --continue-on-error ./test`                       |
| `--output=<file>`              | 将测试结果输出到指定文件                                     | `llvm-lit --output=result.txt ./test`                       |
| `--no-filecheck`               | 禁用 `FileCheck` 输出的生成                                  | `llvm-lit --no-filecheck ./test`                            |
