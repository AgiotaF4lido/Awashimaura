
export type Point = { x: number; y: number };

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

export type NPCData = {
  name: string;
  text: string;
  x: number;
  y: number;
  color: string;
};

export type RoomData = {
  id: number;
  walls: Rect[];
  decor: Rect[];
  exits: {
    up?: number;
    down?: number;
    left?: number;
    right?: number;
  };
  hasEntity?: boolean;
  message?: string;
  npc?: NPCData;
};

export type GameState = {
  isIntro: boolean;
  currentRoomId: number;
  playerPos: Point;
  cycle: number;
  hasKey: boolean;
  inventory: string[];
  isInteracting: boolean;
  showDialog: boolean;
  dialogText: string;
  isEntityDead: boolean;
  isRejected: boolean;
  isAccepted: boolean;
  isGameOver: boolean;
  isWaitingForChoice: boolean;
  visitedRooms: number[];
};
