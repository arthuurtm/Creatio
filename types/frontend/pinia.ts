import 'pinia'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | PersistenceOptions<S> | PersistenceOptions<S>[]
  }
}
