---
title: RVRegisterClass, VGPR, and RISCVReg VGPR
author: Lee
---

## Example

```cpp
// RVRegisterClass definition, representing a generic register class
class RVRegisterClass <string n, list<ValueType> rTypes, int Align, dag rList>
  : RegisterClass <n, rTypes, Align, rList> {
  // vALU and sALU registers
  field bit IsVGPR = 0;
  field bit IsSGPR = 0;
  field bit IsFGPR = 0;

  let TSFlags{0} = IsVGPR;
  let TSFlags{1} = IsSGPR;
  let TSFlags{2} = IsFGPR;
}

// VGPR inherits from RVRegisterClass, representing a specific vector register
// VGPR 32-bit register class
def VGPR : RVRegisterClass<"RISCV",
                            !listconcat(Reg32Types.types, Reg16Types.types),
                            32,
                            (add (sequence "V%u", 0, 255))> {
  let Size = 32;
  let IsVGPR = 1;
}

// RISCVReg: VGPR is a specific register class, representing RISC-V's vector register
def V0 : VGPR<"V0">;
def V1 : VGPR<"V1">;
```

In this example, `VGPR` inherits from `RVRegisterClass`, and `V0` and `V1` are specific register instances.
