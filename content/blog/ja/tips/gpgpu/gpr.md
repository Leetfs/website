---
title: RVRegisterClass、VGPR と RISCVReg VGPR
author: リー
---

## 例

```cpp
// RVRegisterClass 定義、一般的なレジスタクラスを表す
class RVRegisterClass <string n, list<ValueType> rTypes, int Align, dag rList>
  : RegisterClass <n, rTypes, Align, rList> {
  // vALU と sALU レジスタ
  field bit IsVGPR = 0;
  field bit IsSGPR = 0;
  field bit IsFGPR = 0;

  let TSFlags{0} = IsVGPR;
  let TSFlags{1} = IsSGPR;
  let TSFlags{2} = IsFGPR;
}

// VGPR は RVRegisterClass から継承し、具体的なベクトルレジスタを表す
// VGPR 32-bit レジスタクラス
def VGPR : RVRegisterClass<"RISCV",
                            !listconcat(Reg32Types.types, Reg16Types.types),
                            32,
                            (add (sequence "V%u", 0, 255))> {
  let Size = 32;
  let IsVGPR = 1;
}

// RISCVReg: VGPR は具体的なレジスタクラスで、RISC-V のベクトルレジスタを表す
def V0 : VGPR<"V0">;
def V1 : VGPR<"V1">;
```

この例では、`VGPR` は `RVRegisterClass` から継承され、`V0` と `V1` は具体的なレジスタインスタンスです。
