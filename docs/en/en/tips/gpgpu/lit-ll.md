---
title: Use lit to test LLVM IR files
author: Lee
---

## Term Match

- lit: LLVM Integrated Tester
- .ll: LLVM IR file

## Prerequisites

llvm installed

## Test Process

```yaml
float.ll
  |
  v
lit executes RUN command -> llc generates output
  |
  v
FileCheck verifies output
  |
  +--✔️ All match: PASS
  |
  +--❌ Error: FAIL
```

## Execution Statement

You can specify a single file or a directory.

```bash
llvm-lit llvm/test/CodeGen/RISCV/VentusGPGPU/float.ll
```

## Output

```bash
-- Testing: 1 tests, 1 workers --
PASS: LLVM :: CodeGen/RISCV/VentusGPGPU/float.ll (1 of 1)

Testing Time: 0.07s
  Passed: 1
```

## Common Commands

| Command                  | Description                                                                             | Example                               |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------- |
| `llvm-lit <test_dir>`    | Run all test cases in the specified directory                                           | `llvm-lit ./test`                     |
| `-v` or `--verbose`      | Show detailed test output                                                               | `llvm-lit -v ./test`                  |
| `-j <N>` or `--jobs=<N>` | Specify the number of tests to run in parallel                                          | `llvm-lit -j 4 ./test`                |
| `--max-tests <N>`        | Limit the maximum number of tests to run                                                | `llvm-lit --max-tests=100 ./test`     |
| `--filter=<pattern>`     | Run tests that match the given pattern (filter by test name)         | `llvm-lit --filter=xyz ./test`        |
| `--show-unsupported`     | Display unsupported tests                                                               | `llvm-lit --show-unsupported ./test`  |
| `--test-messages`        | Show detailed output of each test (includes stdout and stderr)       | `llvm-lit --test-messages ./test`     |
| `--help`                 | Show the help documentation of `llvm-lit`, listing all supported options and parameters | `llvm-lit --help`                     |
| `--dump-input=help`      | If the test fails, display the input to help debug the failure                          | `llvm-lit --dump-input=help ./test`   |
| `--continue-on-error`    | Continue running other tests without stopping if a test fails                           | `llvm-lit --continue-on-error ./test` |
| `--output=<file>`        | Output test results to the specified file                                               | `llvm-lit --output=result.txt ./test` |
| `--no-filecheck`         | Disable the generation of `FileCheck` output                                            | `llvm-lit --no-filecheck ./test`      |
