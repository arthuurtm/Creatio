export interface GameNode {
  id: string
  type: 'dialog' | 'combat' | 'event'
  position: { x: number; y: number }
  data: any
}

export interface GameConnection {
  source: string
  target: string
  sourceHandle: string
}

export interface GameAction {
  id: string
  trigger: string
  payload: Record<string, any>
}
