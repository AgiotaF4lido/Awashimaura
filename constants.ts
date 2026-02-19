
import { RoomData, NPCData, Rect } from './types';

export const CANVAS_WIDTH = 160;
export const CANVAS_HEIGHT = 96;
export const SCALE = 5;

export const PLAYER_SIZE = 4;
export const PLAYER_COLOR = '#00FF00';
export const WALL_COLOR = '#444444';
export const REJECTED_WALL_COLOR = '#880000'; 
export const ACCEPTED_WALL_COLOR = '#6b4423'; // Madeira quente
export const DECOR_COLOR = '#222222';
export const ENTITY_COLOR = '#FF00FF';

const MAZE_CONNECTIONS: Record<number, { up?: number; down?: number; left?: number; right?: number }> = {
  0: { right: 1, down: 5 },
  1: { left: 0, right: 2, down: 6 },
  2: { left: 1, right: 3 },
  3: { left: 2, right: 4, down: 8 },
  4: { left: 3, down: 9 },
  5: { up: 0, down: 10 },
  6: { up: 1, right: 7, down: 11 },
  7: { left: 6, right: 8 },
  8: { left: 7, up: 3, down: 13 },
  9: { up: 4, down: 14 },
  10: { up: 5, right: 11, down: 15 },
  11: { left: 10, up: 6, right: 12 },
  12: { left: 11, right: 13, down: 17 }, 
  13: { left: 12, up: 8, right: 14 },
  14: { left: 13, up: 9, down: 19 },
  15: { up: 10, right: 16, down: 20 }, 
  16: { left: 15, down: 21 },
  17: { up: 12, right: 18, down: 22 },
  18: { left: 17, right: 19, down: 23 },
  19: { left: 18, up: 14, down: 24 },
  20: { up: 15, right: 21, down: 25 },
  21: { left: 20, up: 16, right: 22 },
  22: { left: 21, up: 17, down: 27 },
  23: { up: 18, right: 24, down: 28 },
  24: { left: 23, up: 19, down: 29 },
  25: { up: 20, right: 26 },
  26: { left: 25, right: 27 },
  27: { left: 26, up: 22, right: 28 },
  28: { left: 27, up: 23, right: 29 },
  29: { left: 28, up: 24 } 
};

export const generateWorld = (cycle: number, isRejected: boolean = false, isAccepted: boolean = false): RoomData[] => {
  const rooms: RoomData[] = [];
  const totalRooms = 30;
  
  let currentWallColor = WALL_COLOR;
  if (isRejected) currentWallColor = REJECTED_WALL_COLOR;
  else if (isAccepted) currentWallColor = ACCEPTED_WALL_COLOR;

  // Paletas
  const gold = '#FFD700';
  const midGold = '#CCAA00';
  const darkGold = '#554400';
  const izWood = '#5a3a22';
  const lanternRed = '#FF0000';
  const sakuraPink = '#ffb7c5';
  const sand = '#f5deb3';
  const sea = '#0066cc';

  for (let i = 0; i < totalRooms; i++) {
    const walls: Rect[] = [];
    const decor: Rect[] = [];
    let exits = { ...MAZE_CONNECTIONS[i] };

    if (isAccepted) {
      if (i === 29) {
        delete exits.up;
      }
      if (i === 24) {
        delete exits.down;
      }
    }

    // Paredes externas
    walls.push({ id: `w_t_${i}`, x: 0, y: 0, w: CANVAS_WIDTH, h: 4, color: currentWallColor } as any);
    walls.push({ id: `w_b_${i}`, x: 0, y: CANVAS_HEIGHT - 4, w: CANVAS_WIDTH, h: 4, color: currentWallColor } as any);
    walls.push({ id: `w_l_${i}`, x: 0, y: 0, w: 4, h: CANVAS_HEIGHT, color: currentWallColor } as any);
    walls.push({ id: `w_r_${i}`, x: CANVAS_WIDTH - 4, y: 0, w: 4, h: CANVAS_HEIGHT, color: currentWallColor } as any);

    if (exits.up !== undefined) {
      const idx = walls.findIndex((w: any) => w.id === `w_t_${i}`);
      if (idx !== -1) { walls.splice(idx, 1); walls.push({ x: 0, y: 0, w: 60, h: 4, color: currentWallColor }, { x: 100, y: 0, w: 60, h: 4, color: currentWallColor }); }
    }
    if (exits.down !== undefined) {
      const idx = walls.findIndex((w: any) => w.id === `w_b_${i}`);
      if (idx !== -1) { walls.splice(idx, 1); walls.push({ x: 0, y: CANVAS_HEIGHT - 4, w: 60, h: 4, color: currentWallColor }, { x: 100, y: CANVAS_HEIGHT - 4, w: 60, h: 4, color: currentWallColor }); }
    }
    if (exits.left !== undefined) {
      const idx = walls.findIndex((w: any) => w.id === `w_l_${i}`);
      if (idx !== -1) { walls.splice(idx, 1); walls.push({ x: 0, y: 0, w: 4, h: 36, color: currentWallColor }, { x: 0, y: 60, w: 4, h: 36, color: currentWallColor }); }
    }
    if (exits.right !== undefined) {
      const idx = walls.findIndex((w: any) => w.id === `w_r_${i}`);
      if (idx !== -1) { walls.splice(idx, 1); walls.push({ x: CANVAS_WIDTH - 4, y: 0, w: 4, h: 36, color: currentWallColor }, { x: CANVAS_WIDTH - 4, y: 60, w: 4, h: 36, color: currentWallColor }); }
    }

    if (isAccepted) {
      if (i === 29) {
        decor.push({ x: 0, y: 4, w: CANVAS_WIDTH, h: 40, color: sea });
        decor.push({ x: 0, y: 44, w: CANVAS_WIDTH, h: 2, color: '#FFF' });
        decor.push({ x: 0, y: 46, w: CANVAS_WIDTH, h: 50, color: sand });
        decor.push({ x: 120, y: 15, w: 20, h: 20, color: '#ffffcc' });
        walls.push({ x: 0, y: 0, w: CANVAS_WIDTH, h: 44, color: 'transparent' });
      } else if (i === 12) {
        decor.push({ x: 45, y: 10, w: 70, h: 80, color: izWood });
        decor.push({ x: 50, y: 15, w: 60, h: 70, color: '#331a00' });
        decor.push({ x: 75, y: 60, w: 10, h: 25, color: '#000' });
        decor.push({ x: 40, y: 25, w: 5, h: 12, color: lanternRed }, { x: 115, y: 25, w: 5, h: 12, color: lanternRed });
        for(let j=0; j<10; j++) decor.push({ x: 10 + Math.random()*30, y: 10 + Math.random()*70, w: 3, h: 3, color: sakuraPink });
      } else {
        for(let j=0; j<5; j++) decor.push({ x: Math.random()*140, y: Math.random()*80, w: 2, h: 2, color: sakuraPink });
      }
    } else {
      const progress = i / totalRooms;
      const ruinsCount = (4 + Math.floor(cycle * 0.4) + Math.floor(progress * 6)) * (isRejected ? 3 : 1);
      for (let j = 0; j < ruinsCount; j++) {
        const x = 10 + Math.random() * (CANVAS_WIDTH - 25); const y = 10 + Math.random() * (CANVAS_HEIGHT - 35);
        if (i === 12 && x > 45 && x < 115 && y > 10 && y < 90) continue;
        decor.push({ x, y, w: 2+Math.random()*6, h: 2+Math.random()*10, color: isRejected ? '#330000' : DECOR_COLOR });
      }
      if (i === 12) {
        const wallC = isRejected ? '#3d1d1d' : darkGold;
        const doorC = isRejected ? '#2d2d2d' : gold;
        decor.push({ x: 50, y: 15, w: 60, h: 70, color: wallC });
        decor.push({ x: 55, y: 20, w: 50, h: 60, color: doorC });
        decor.push({ x: 75, y: 60, w: 10, h: 20, color: '#000' });
      }
    }

    let npc: NPCData | undefined = undefined;
    if (isAccepted) {
      if (i === 6) npc = { name: "Yuriko Sato", text: "Vem amor! Vamos ver o mar", x: 40, y: 40, color: "#FFC0CB" };
      if (i === 29) npc = { name: "Yuriko Sato", text: "Finalmente chegamos... O sol nunca se põe aqui.", x: 80, y: 65, color: "#FFC0CB" };
    } else {
      if (i === 6) {
        npc = { 
          name: isRejected ? "Cadáver Pútrido" : "Velho Pescador", 
          text: isRejected ? "A luz devora a carne..." : "Parece que nosso pequeno experimento deu certo... Yuuto...", 
          x: 40, y: 40, color: isRejected ? "#778800" : "#181818" 
        };
      }
    }

    rooms.push({ id: i, walls, decor, exits, hasEntity: i === 29 && !isAccepted, npc });
  }

  // INTERIORES ESPECIAIS
  if (isAccepted) {
    rooms.push({
      id: 99,
      walls: [{ x: 0, y: 0, w: CANVAS_WIDTH, h: 15, color: izWood }, { x: 0, y: 81, w: CANVAS_WIDTH, h: 15, color: izWood }, { x: 0, y: 15, w: 4, h: 66, color: izWood }, { x: CANVAS_WIDTH-4, y: 15, w: 4, h: 21, color: izWood }, { x: CANVAS_WIDTH-4, y: 60, w: 4, h: 21, color: izWood }],
      decor: [{ x: 4, y: 15, w: CANVAS_WIDTH-8, h: 66, color: '#2d1e12' }, { x: 40, y: 45, w: 110, h: 8, color: '#4d3b2f' }, { x: 0, y: 36, w: 4, h: 24, color: '#000' }],
      exits: { right: 100 },
      npc: { name: "Mr. Sandman", text: "Bem-vindo ao Izayaka Vazio Calmo. O que o senhor vai pedir hoje?", x: 80, y: 38, color: "#4682b4" }
    });
    rooms.push({
      id: 100,
      walls: [{ x: 0, y: 0, w: CANVAS_WIDTH, h: 15, color: izWood }, { x: 0, y: 81, w: CANVAS_WIDTH, h: 15, color: izWood }, { x: 0, y: 15, w: 4, h: 21, color: izWood }, { x: 0, y: 60, w: 4, h: 21, color: izWood }, { x: CANVAS_WIDTH-4, y: 15, w: 4, h: 76, color: izWood }],
      decor: [{ x: 4, y: 15, w: CANVAS_WIDTH-8, h: 66, color: '#2d1e12' }, { x: 20, y: 30, w: 120, h: 40, color: '#d2b48c' }],
      exits: { left: 99 }
    });
  } else if (isRejected) {
    const labWall = '#3d1d1d';
    const labDetail = '#5d2d2d';
    const toxicGreen = '#00ff00';
    
    // Sala 99: Sala de Tecnologia - PERIGO! PERIGO!
    rooms.push({ 
      id: 99, 
      walls: [
        { x: 0, y: 0, w: CANVAS_WIDTH, h: 12, color: labWall },
        { x: 0, y: 84, w: CANVAS_WIDTH, h: 12, color: labWall },
        { x: 0, y: 12, w: 4, h: 24, color: labDetail },
        { x: 0, y: 60, w: 4, h: 24, color: labDetail },
        { x: CANVAS_WIDTH-4, y: 12, w: 4, h: 24, color: labDetail },
        { x: CANVAS_WIDTH-4, y: 60, w: 4, h: 24, color: labDetail }
      ], 
      decor: [
        // Monitor Central
        { x: 40, y: 20, w: 80, h: 30, color: '#111' }, 
        { x: 42, y: 22, w: 76, h: 26, color: '#050505' },
        
        // Letreiro Digital 'PERIGO' simplificado (Pixel art blocks)
        { x: 48, y: 28, w: 8, h: 8, color: '#f00' },
        { x: 60, y: 28, w: 8, h: 8, color: '#f00' },
        { x: 72, y: 28, w: 8, h: 8, color: '#f00' },
        { x: 84, y: 28, w: 8, h: 8, color: '#f00' },
        { x: 96, y: 28, w: 8, h: 8, color: '#f00' },
        { x: 108, y: 28, w: 8, h: 8, color: '#f00' },
        
        { x: 10, y: 65, w: 20, h: 10, color: '#111' }, // Terminais
        { x: 130, y: 65, w: 20, h: 10, color: '#111' },
        
        { x: 0, y: 36, w: 4, h: 24, color: '#000' },   
        { x: CANVAS_WIDTH-4, y: 36, w: 4, h: 24, color: '#000' }
      ], 
      exits: { right: 100 }, 
      npc: { name: "", text: "PERIGO! PERIGO!", x: 80, y: 35, color: "transparent" }
    });

    // Sala 100: Reator Nuclear Central
    rooms.push({ 
      id: 100, 
      walls: [
        { x: 0, y: 0, w: CANVAS_WIDTH, h: 10, color: labWall },
        { x: 0, y: 86, w: CANVAS_WIDTH, h: 10, color: labWall },
        { x: 0, y: 10, w: 4, h: 26, color: labDetail },
        { x: 0, y: 60, w: 4, h: 26, color: labDetail },
        { x: CANVAS_WIDTH-4, y: 10, w: 4, h: 76, color: labDetail }
      ], 
      decor: [
        // REATOR NUCLEAR NO CENTRO
        { x: 60, y: 28, w: 40, h: 40, color: '#080808' }, // Carcaça
        { x: 65, y: 33, w: 30, h: 30, color: '#1a1a1a' }, // Câmara
        { x: 70, y: 38, w: 20, h: 20, color: toxicGreen }, // NÚCLEO (PULSANTE)
        
        // Tubulações complexas
        { x: 0, y: 46, w: 60, h: 4, color: labDetail },
        { x: 100, y: 46, w: 60, h: 4, color: labDetail },
        { x: 78, y: 10, w: 4, h: 18, color: labDetail },
        { x: 78, y: 68, w: 4, h: 18, color: labDetail },
        
        // Resíduos
        { x: 10, y: 80, w: 140, h: 6, color: '#003300' },
        
        { x: 0, y: 36, w: 4, h: 24, color: '#000' }
      ], 
      exits: { left: 99 }
    });
  } else {
    // JOGO BASE: TEMPLO
    rooms.push({ 
      id: 99, 
      walls: [
        { x: 0, y: 0, w: CANVAS_WIDTH, h: 12, color: darkGold }, 
        { x: 0, y: 84, w: CANVAS_WIDTH, h: 12, color: darkGold }, 
        { x: 0, y: 12, w: 4, h: 24, color: gold }, 
        { x: 0, y: 60, w: 4, h: 24, color: gold }, 
        { x: CANVAS_WIDTH-4, y: 12, w: 4, h: 24, color: gold }, 
        { x: CANVAS_WIDTH-4, y: 60, w: 4, h: 24, color: gold }
      ], 
      decor: [
        { x: 20, y: 12, w: 6, h: 72, color: midGold },
        { x: 134, y: 12, w: 6, h: 72, color: midGold },
        { x: 40, y: 46, w: 80, h: 4, color: midGold },
        { x: 0, y: 36, w: 4, h: 24, color: '#000' }
      ], 
      exits: { right: 100 }, 
      message: "O silêncio do ouro é pesado." 
    });

    rooms.push({ 
      id: 100, 
      walls: [
        { x: 0, y: 0, w: CANVAS_WIDTH, h: 10, color: darkGold }, 
        { x: 0, y: 86, w: CANVAS_WIDTH, h: 10, color: darkGold }, 
        { x: 0, y: 10, w: 4, h: 26, color: gold }, 
        { x: 0, y: 60, w: 4, h: 26, color: gold }, 
        { x: CANVAS_WIDTH-4, y: 10, w: 4, h: 26, color: gold }, 
        { x: CANVAS_WIDTH-4, y: 60, w: 4, h: 26, color: gold }
      ], 
      decor: [
        { x: 70, y: 40, w: 20, h: 4, color: midGold }, 
        { x: 74, y: 36, w: 12, h: 4, color: midGold }, 
        { x: 76, y: 26, w: 8, h: 10, color: gold }, 
        { x: 74, y: 22, w: 12, h: 4, color: gold }, 
        { x: 74, y: 22, w: 2, h: 14, color: gold }, 
        { x: 84, y: 22, w: 2, h: 14, color: gold }, 
      ], 
      exits: { left: 99, right: 101 },
      npc: { name: "", text: "Trono do Rei Amarelo", x: 80, y: 28, color: "transparent" }
    });

    rooms.push({ 
      id: 101, 
      walls: [
        { x: 0, y: 0, w: CANVAS_WIDTH, h: 10, color: darkGold }, 
        { x: 0, y: 86, w: CANVAS_WIDTH, h: 10, color: darkGold }, 
        { x: CANVAS_WIDTH-4, y: 10, w: 4, h: 76, color: darkGold }, 
        { x: 0, y: 10, w: 4, h: 26, color: gold }, 
        { x: 0, y: 60, w: 4, h: 26, color: gold }
      ], 
      decor: [
        { x: 75, y: 45, w: 10, h: 10, color: midGold },
        { x: 78, y: 38, w: 4, h: 6, color: '#8b4513' }, 
        { x: 79, y: 34, w: 2, h: 4, color: '#deb887' }, 
      ], 
      exits: { left: 100 },
      npc: { name: "", text: "Violino do Pescador", x: 80, y: 38, color: "transparent" }
    });
  }

  return rooms;
};
