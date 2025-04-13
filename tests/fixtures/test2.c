#include "List.h"

// Dispatch an event to all listeners
void EventEmitter__emit(
    Arena* arena,
    EventEmitter* emitter,
    EventType event,
    void* source,
    void* data,
    Dispatcher__call_t cb) {
  // find EventTuple1 by EventType
  // #meta FOR_EACH_LIST(emitter->events, EventTuple1*, tup)
  List__Node* __node = emitter->events->head;
  u32 __len = emitter->events->len; // cache; may mutate
  for (u32 __i = 0; __i < __len; __i++) {
    EventTuple1* tup = __node->data;
    __node = __node->next;
    // #metaend
    if (tup->event == event) {
      // iterate Listeners
      // #meta FOR_EACH_LIST(tup->listeners, c2, EventTuple2*, v)
      List__Node* __node = tup->listeners->head;
      u32 __len = tup->listeners->len; // cache; may mutate
      for (u32 __i = 0; __i < __len; __i++) {
        c2 EventTuple2* = __node->data;
        __node = __node->next;
        // #metaend
        EventEmitterParams* params = Arena__Push(arena, sizeof(EventEmitterParams));
        params->source = source;
        params->target = v->target;
        params->data = data;
        // invoke callback
        cb(v->listener, params);
      }
    }
  }
}
