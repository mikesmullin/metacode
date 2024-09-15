// #metacode
// #macro ENUM(name,t)
//   // {{name}}.h
//   typedef enum
//   {
//     {{~#for _i,r of t~}}
//     {{name}}_{{r.k}},
//     {{~/for~}}
//     {{name}}__COUNT
//   } {{name}};
//
//   extern char* {{name}}__STRINGS[{{#t}}];
//
//   // {{name}}.c
//   char* {{name}}__STRINGS[{{#t}}] =
//   {
//     {{~#for r of t~}}
//     "{{r.k}}",
//     {{~/for~}}
//   };
//
// #table T_CAT_BREEDS
//   k          |
//   Persian    |
//   MaineCoon  |
//   Siamese    |
//   Bengal     |
//
// ENUM(CatBreed, T_CAT_BREEDS)
// #metagen
// CatBreed.h
typedef enum {
  CatBreed_Persian,
  CatBreed_MaineCoon,
  CatBreed_Siamese,
  CatBreed_Bengal,
  CatBreed__COUNT
} CatBreed;

extern char* CatBreed__STRINGS[4];

// CatBreed.c
char* CatBreed__STRINGS[4] = {
    "Persian",
    "MaineCoon",
    "Siamese",
    "Bengal",
};
// #metaend