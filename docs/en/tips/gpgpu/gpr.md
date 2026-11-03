---
title: RVRegisterClass、VGPR 与 RISCVReg VGPR
author: Lee
---

## 示例

```cpp
// RVRegisterClass 定义，表示一种通用的寄存器类别
class RVRegisterClass <string n, list<ValueType> rTypes, int Align, dag rList>
  : RegisterClass <n, rTypes, Align, rList> {
  // vALU 和 sALU 寄存器
  field bit IsVGPR = 0;
  field bit IsSGPR = 0;
  field bit IsFGPR = 0;

  let TSFlags{0} = IsVGPR;
  let TSFlags{1} = IsSGPR;
  let TSFlags{2} = IsFGPR;
}

// VGPR 继承自 RVRegisterClass，表示具体的向量寄存器
// VGPR 32-bit 寄存器类
def VGPR : RVRegisterClass<"RISCV",
                            !listconcat(Reg32Types.types, Reg16Types.types),
                            32,
                            (add (sequence "V%u", 0, 255))> {
  let Size = 32;
  let IsVGPR = 1;
}

// RISCVReg: VGPR 是一个具体的寄存器类，表示 RISC-V 的向量寄存器
def V0 : VGPR<"V0">;
def V1 : VGPR<"V1">;
```

在这个例子中，`VGPR` 继承自 `RVRegisterClass`，而 `V0` 和 `V1` 就是具体的寄存器实例。
