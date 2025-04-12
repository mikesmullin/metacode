// #metacode
// #macro MACRO1(T1)
//   {{~#for T1}}
//   // {{this.op}}
//   extern inline void v1_{{this.op}}(v1* dst, v1* a, v1* b) {
//     dst->x = a->x {{this.oper}} b->x;
//   }
//
//   extern inline void v2_{{this.op}}(v2* dst, v2* a, v2* b) {
//     v1_{{this.op}}((v1*)dst, (v1*)a, (v1*)b);
//     dst->y = a->y {{this.oper}} b->y;
//   }
//
//   extern inline void v3_{{this.op}}(v3* dst, v3* a, v3* b) {
//     v2_{{this.op}}((v2*)dst, (v2*)a, (v2*)b);
//     dst->z = a->z {{this.oper}} b->z;
//   }
//
//   extern inline void v4_{{this.op}}(v4* dst, v4* a, v4* b) {
//     v3_{{this.op}}((v3*)dst, (v3*)a, (v3*)b);
//     dst->w = a->w {{this.oper}} b->w;
//   }
//
//   // {{this.op}} scalar
//
//   extern inline void v1_{{this.op}}S(v1* dst, v1* a, f32 s) {
//     dst->x = a->x {{this.oper}} s;
//   }
//
//   extern inline void v2_{{this.op}}S(v2* dst, v2* a, f32 s) {
//     v1_{{this.op}}S((v1*)dst, (v1*)a, s);
//     dst->y = a->y {{this.oper}} s;
//   }
//
//   extern inline void v3_{{this.op}}S(v3* dst, v3* a, f32 s) {
//     v2_{{this.op}}S((v2*)dst, (v2*)a, s);
//     dst->z = a->z {{this.oper}} s;
//   }
//
//   extern inline void v4_{{this.op}}S(v4* dst, v4* a, f32 s) {
//     v3_{{this.op}}S((v3*)dst, (v3*)a, s);
//     dst->w = a->w {{this.oper}} s;
//   }
//   {{~/for~}}
//
// #table T_VARS
//   op  | oper |
//   mul | *    |
//   div | /    |
//   add | +    |
//   sub | -    |
//
// MACRO1(T_VARS)
// #metagen

// mul
extern inline void v1_mul(v1* dst, v1* a, v1* b) {
  dst->x = a->x * b->x;
}

extern inline void v2_mul(v2* dst, v2* a, v2* b) {
  v1_mul((v1*)dst, (v1*)a, (v1*)b);
  dst->y = a->y * b->y;
}

extern inline void v3_mul(v3* dst, v3* a, v3* b) {
  v2_mul((v2*)dst, (v2*)a, (v2*)b);
  dst->z = a->z * b->z;
}

extern inline void v4_mul(v4* dst, v4* a, v4* b) {
  v3_mul((v3*)dst, (v3*)a, (v3*)b);
  dst->w = a->w * b->w;
}

// mul scalar

extern inline void v1_mulS(v1* dst, v1* a, f32 s) {
  dst->x = a->x * s;
}

extern inline void v2_mulS(v2* dst, v2* a, f32 s) {
  v1_mulS((v1*)dst, (v1*)a, s);
  dst->y = a->y * s;
}

extern inline void v3_mulS(v3* dst, v3* a, f32 s) {
  v2_mulS((v2*)dst, (v2*)a, s);
  dst->z = a->z * s;
}

extern inline void v4_mulS(v4* dst, v4* a, f32 s) {
  v3_mulS((v3*)dst, (v3*)a, s);
  dst->w = a->w * s;
}

// div
extern inline void v1_div(v1* dst, v1* a, v1* b) {
  dst->x = a->x / b->x;
}

extern inline void v2_div(v2* dst, v2* a, v2* b) {
  v1_div((v1*)dst, (v1*)a, (v1*)b);
  dst->y = a->y / b->y;
}

extern inline void v3_div(v3* dst, v3* a, v3* b) {
  v2_div((v2*)dst, (v2*)a, (v2*)b);
  dst->z = a->z / b->z;
}

extern inline void v4_div(v4* dst, v4* a, v4* b) {
  v3_div((v3*)dst, (v3*)a, (v3*)b);
  dst->w = a->w / b->w;
}

// div scalar

extern inline void v1_divS(v1* dst, v1* a, f32 s) {
  dst->x = a->x / s;
}

extern inline void v2_divS(v2* dst, v2* a, f32 s) {
  v1_divS((v1*)dst, (v1*)a, s);
  dst->y = a->y / s;
}

extern inline void v3_divS(v3* dst, v3* a, f32 s) {
  v2_divS((v2*)dst, (v2*)a, s);
  dst->z = a->z / s;
}

extern inline void v4_divS(v4* dst, v4* a, f32 s) {
  v3_divS((v3*)dst, (v3*)a, s);
  dst->w = a->w / s;
}

// add
extern inline void v1_add(v1* dst, v1* a, v1* b) {
  dst->x = a->x + b->x;
}

extern inline void v2_add(v2* dst, v2* a, v2* b) {
  v1_add((v1*)dst, (v1*)a, (v1*)b);
  dst->y = a->y + b->y;
}

extern inline void v3_add(v3* dst, v3* a, v3* b) {
  v2_add((v2*)dst, (v2*)a, (v2*)b);
  dst->z = a->z + b->z;
}

extern inline void v4_add(v4* dst, v4* a, v4* b) {
  v3_add((v3*)dst, (v3*)a, (v3*)b);
  dst->w = a->w + b->w;
}

// add scalar

extern inline void v1_addS(v1* dst, v1* a, f32 s) {
  dst->x = a->x + s;
}

extern inline void v2_addS(v2* dst, v2* a, f32 s) {
  v1_addS((v1*)dst, (v1*)a, s);
  dst->y = a->y + s;
}

extern inline void v3_addS(v3* dst, v3* a, f32 s) {
  v2_addS((v2*)dst, (v2*)a, s);
  dst->z = a->z + s;
}

extern inline void v4_addS(v4* dst, v4* a, f32 s) {
  v3_addS((v3*)dst, (v3*)a, s);
  dst->w = a->w + s;
}

// sub
extern inline void v1_sub(v1* dst, v1* a, v1* b) {
  dst->x = a->x - b->x;
}

extern inline void v2_sub(v2* dst, v2* a, v2* b) {
  v1_sub((v1*)dst, (v1*)a, (v1*)b);
  dst->y = a->y - b->y;
}

extern inline void v3_sub(v3* dst, v3* a, v3* b) {
  v2_sub((v2*)dst, (v2*)a, (v2*)b);
  dst->z = a->z - b->z;
}

extern inline void v4_sub(v4* dst, v4* a, v4* b) {
  v3_sub((v3*)dst, (v3*)a, (v3*)b);
  dst->w = a->w - b->w;
}

// sub scalar

extern inline void v1_subS(v1* dst, v1* a, f32 s) {
  dst->x = a->x - s;
}

extern inline void v2_subS(v2* dst, v2* a, f32 s) {
  v1_subS((v1*)dst, (v1*)a, s);
  dst->y = a->y - s;
}

extern inline void v3_subS(v3* dst, v3* a, f32 s) {
  v2_subS((v2*)dst, (v2*)a, s);
  dst->z = a->z - s;
}

extern inline void v4_subS(v4* dst, v4* a, f32 s) {
  v3_subS((v3*)dst, (v3*)a, s);
  dst->w = a->w - s;
}
// #metaend
