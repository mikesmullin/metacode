// #metacode
// #macro MACRO1(T1)
//   {{~#for T1}}
//   // {{this.op}}
//   inline v1 v1_{{this.op}}(v1 a, v1 b) {
//     v1 dst;
//     dst.x = a.x {{this.oper}} b.x;
//     return dst;
//   }
//
//   inline v2 v2_{{this.op}}(v2 a, v2 b) {
//     v2 dst;
//     dst.x = a.x {{this.oper}} b.x;
//     dst.y = a.y {{this.oper}} b.y;
//     return dst;
//   }
//
//   inline v3 v3_{{this.op}}(v3 a, v3 b) {
//     v3 dst;
//     dst.x = a.x {{this.oper}} b.x;
//     dst.y = a.y {{this.oper}} b.y;
//     dst.z = a.z {{this.oper}} b.z;
//     return dst;
//   }
//
//   inline v4 v4_{{this.op}}(v4 a, v4 b) {
//     v4 dst;
//     dst.x = a.x {{this.oper}} b.x;
//     dst.y = a.y {{this.oper}} b.y;
//     dst.z = a.z {{this.oper}} b.z;
//     dst.w = a.w {{this.oper}} b.w;
//     return dst;
//   }
//
//   // {{this.op}} scalar
//
//   inline v1 v1_{{this.op}}S(v1 a, f32 s) {
//     v1 dst;
//     dst.x = a.x {{this.oper}} s;
//     return dst;
//   }
//
//   inline v2 v2_{{this.op}}S(v2 a, f32 s) {
//     v2 dst;
//     dst.x = a.x {{this.oper}} s;
//     dst.y = a.y {{this.oper}} s;
//     return dst;
//   }
//
//   inline v3 v3_{{this.op}}S(v3 a, f32 s) {
//     v3 dst;
//     dst.x = a.x {{this.oper}} s;
//     dst.y = a.y {{this.oper}} s;
//     dst.z = a.z {{this.oper}} s;
//     return dst;
//   }
//
//   inline v4 v4_{{this.op}}S(v4 a, f32 s) {
//     v4 dst;
//     dst.x = a.x {{this.oper}} s;
//     dst.y = a.y {{this.oper}} s;
//     dst.z = a.z {{this.oper}} s;
//     dst.w = a.w {{this.oper}} s;
//     return dst;
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
inline v1 v1_mul(v1 a, v1 b) {
  v1 dst;
  dst.x = a.x * b.x;
  return dst;
}

inline v2 v2_mul(v2 a, v2 b) {
  v2 dst;
  dst.x = a.x * b.x;
  dst.y = a.y * b.y;
  return dst;
}

inline v3 v3_mul(v3 a, v3 b) {
  v3 dst;
  dst.x = a.x * b.x;
  dst.y = a.y * b.y;
  dst.z = a.z * b.z;
  return dst;
}

inline v4 v4_mul(v4 a, v4 b) {
  v4 dst;
  dst.x = a.x * b.x;
  dst.y = a.y * b.y;
  dst.z = a.z * b.z;
  dst.w = a.w * b.w;
  return dst;
}

// mul scalar

inline v1 v1_mulS(v1 a, f32 s) {
  v1 dst;
  dst.x = a.x * s;
  return dst;
}

inline v2 v2_mulS(v2 a, f32 s) {
  v2 dst;
  dst.x = a.x * s;
  dst.y = a.y * s;
  return dst;
}

inline v3 v3_mulS(v3 a, f32 s) {
  v3 dst;
  dst.x = a.x * s;
  dst.y = a.y * s;
  dst.z = a.z * s;
  return dst;
}

inline v4 v4_mulS(v4 a, f32 s) {
  v4 dst;
  dst.x = a.x * s;
  dst.y = a.y * s;
  dst.z = a.z * s;
  dst.w = a.w * s;
  return dst;
}

// div
inline v1 v1_div(v1 a, v1 b) {
  v1 dst;
  dst.x = a.x / b.x;
  return dst;
}

inline v2 v2_div(v2 a, v2 b) {
  v2 dst;
  dst.x = a.x / b.x;
  dst.y = a.y / b.y;
  return dst;
}

inline v3 v3_div(v3 a, v3 b) {
  v3 dst;
  dst.x = a.x / b.x;
  dst.y = a.y / b.y;
  dst.z = a.z / b.z;
  return dst;
}

inline v4 v4_div(v4 a, v4 b) {
  v4 dst;
  dst.x = a.x / b.x;
  dst.y = a.y / b.y;
  dst.z = a.z / b.z;
  dst.w = a.w / b.w;
  return dst;
}

// div scalar

inline v1 v1_divS(v1 a, f32 s) {
  v1 dst;
  dst.x = a.x / s;
  return dst;
}

inline v2 v2_divS(v2 a, f32 s) {
  v2 dst;
  dst.x = a.x / s;
  dst.y = a.y / s;
  return dst;
}

inline v3 v3_divS(v3 a, f32 s) {
  v3 dst;
  dst.x = a.x / s;
  dst.y = a.y / s;
  dst.z = a.z / s;
  return dst;
}

inline v4 v4_divS(v4 a, f32 s) {
  v4 dst;
  dst.x = a.x / s;
  dst.y = a.y / s;
  dst.z = a.z / s;
  dst.w = a.w / s;
  return dst;
}

// add
inline v1 v1_add(v1 a, v1 b) {
  v1 dst;
  dst.x = a.x + b.x;
  return dst;
}

inline v2 v2_add(v2 a, v2 b) {
  v2 dst;
  dst.x = a.x + b.x;
  dst.y = a.y + b.y;
  return dst;
}

inline v3 v3_add(v3 a, v3 b) {
  v3 dst;
  dst.x = a.x + b.x;
  dst.y = a.y + b.y;
  dst.z = a.z + b.z;
  return dst;
}

inline v4 v4_add(v4 a, v4 b) {
  v4 dst;
  dst.x = a.x + b.x;
  dst.y = a.y + b.y;
  dst.z = a.z + b.z;
  dst.w = a.w + b.w;
  return dst;
}

// add scalar

inline v1 v1_addS(v1 a, f32 s) {
  v1 dst;
  dst.x = a.x + s;
  return dst;
}

inline v2 v2_addS(v2 a, f32 s) {
  v2 dst;
  dst.x = a.x + s;
  dst.y = a.y + s;
  return dst;
}

inline v3 v3_addS(v3 a, f32 s) {
  v3 dst;
  dst.x = a.x + s;
  dst.y = a.y + s;
  dst.z = a.z + s;
  return dst;
}

inline v4 v4_addS(v4 a, f32 s) {
  v4 dst;
  dst.x = a.x + s;
  dst.y = a.y + s;
  dst.z = a.z + s;
  dst.w = a.w + s;
  return dst;
}

// sub
inline v1 v1_sub(v1 a, v1 b) {
  v1 dst;
  dst.x = a.x - b.x;
  return dst;
}

inline v2 v2_sub(v2 a, v2 b) {
  v2 dst;
  dst.x = a.x - b.x;
  dst.y = a.y - b.y;
  return dst;
}

inline v3 v3_sub(v3 a, v3 b) {
  v3 dst;
  dst.x = a.x - b.x;
  dst.y = a.y - b.y;
  dst.z = a.z - b.z;
  return dst;
}

inline v4 v4_sub(v4 a, v4 b) {
  v4 dst;
  dst.x = a.x - b.x;
  dst.y = a.y - b.y;
  dst.z = a.z - b.z;
  dst.w = a.w - b.w;
  return dst;
}

// sub scalar

inline v1 v1_subS(v1 a, f32 s) {
  v1 dst;
  dst.x = a.x - s;
  return dst;
}

inline v2 v2_subS(v2 a, f32 s) {
  v2 dst;
  dst.x = a.x - s;
  dst.y = a.y - s;
  return dst;
}

inline v3 v3_subS(v3 a, f32 s) {
  v3 dst;
  dst.x = a.x - s;
  dst.y = a.y - s;
  dst.z = a.z - s;
  return dst;
}

inline v4 v4_subS(v4 a, f32 s) {
  v4 dst;
  dst.x = a.x - s;
  dst.y = a.y - s;
  dst.z = a.z - s;
  dst.w = a.w - s;
  return dst;
}
// #metaend
