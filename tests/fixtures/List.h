#pragma once

// #metacode
// #macro FOR_EACH_LIST(LIST, TYPE, ITEM)
//   List__Node* __node = {{LIST}}->head;
//   u32 __len = {{LIST}}->len; // cache; may mutate
//   for (u32 __i = 0; __i < __len; __i++) {
//     {{TYPE}} {{ITEM}} = __node->data;
//     __node = __node->next;
// #metaend
