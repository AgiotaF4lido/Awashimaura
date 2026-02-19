
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Point, RoomData } from './types';
import { generateWorld, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, PLAYER_COLOR, SCALE, ENTITY_COLOR } from './constants';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    isIntro: true,
    currentRoomId: 0,
    playerPos: { x: 20, y: 45 },
    cycle: 1,
    hasKey: false,
    inventory: [],
    isInteracting: false,
    showDialog: false,
    dialogText: "",
    isEntityDead: false,
    isRejected: false,
    isAccepted: false,
    isGameOver: false,
    isWaitingForChoice: false,
    visitedRooms: [0],
  });

  const stateRef = useRef<GameState>(gameState);
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const [world, setWorld] = useState<RoomData[]>([]);
  const worldRef = useRef<RoomData[]>([]);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [redFlashOpacity, setRedFlashOpacity] = useState(0);
  const [shake, setShake] = useState(0);
  const [acceptanceProgress, setAcceptanceProgress] = useState(0); 
  const [isTempleTransitioning, setIsTempleTransitioning] = useState(false);
  const [transitionColor, setTransitionColor] = useState('255, 255, 255');
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const newWorld = generateWorld(gameState.cycle, gameState.isRejected, gameState.isAccepted);
    setWorld(newWorld);
    worldRef.current = newWorld;
    audioService.init();
  }, [gameState.cycle, gameState.isRejected, gameState.isAccepted]);

  const checkCollision = (pos: Point, walls: any[]) => {
    const pRect = { x: pos.x, y: pos.y, w: PLAYER_SIZE, h: PLAYER_SIZE };
    for (const wall of walls) {
      if (
        pRect.x < wall.x + wall.w &&
        pRect.x + pRect.w > wall.x &&
        pRect.y < wall.y + wall.h &&
        pRect.y + pRect.h > wall.y
      ) {
        return true;
      }
    }
    return false;
  };

  const triggerTempleTransition = useCallback((toRoomId: number, newPos: Point) => {
    setIsTempleTransitioning(true);
    const state = stateRef.current;
    
    if (state.isAccepted) setTransitionColor('255, 215, 0');
    else if (state.isRejected) setTransitionColor('139, 0, 0');
    else setTransitionColor('255, 255, 255');

    audioService.playTempleTransition();
    
    let opacity = 0;
    const fadeSpeed = 0.04;
    
    const fadeOut = setInterval(() => {
      opacity += fadeSpeed;
      setFlashOpacity(opacity);
      if (opacity >= 1.2) {
        clearInterval(fadeOut);
        setGameState(cur => ({ ...cur, currentRoomId: toRoomId, playerPos: newPos, showDialog: false }));
        setTimeout(() => {
          const fadeIn = setInterval(() => {
            opacity -= fadeSpeed / 2;
            setFlashOpacity(opacity);
            if (opacity <= 0) {
              clearInterval(fadeIn);
              setFlashOpacity(0);
              setIsTempleTransitioning(false);
            }
          }, 20);
        }, 400);
      }
    }, 20);
  }, []);

  const movePlayer = useCallback(() => {
    const prev = stateRef.current;
    if (prev.isGameOver || prev.isIntro || acceptanceProgress > 0 || isTempleTransitioning) return;

    const currentRoom = worldRef.current.find(r => r.id === prev.currentRoomId);
    if (!currentRoom) return;

    if (prev.isWaitingForChoice) return;
    if (prev.showDialog && !currentRoom.npc) return;

    let { x, y } = prev.playerPos;
    const speed = 1.3;
    let nextX = x;
    let nextY = y;
    let moved = false;

    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
      const potX = nextX - speed;
      if (!checkCollision({ x: potX, y: nextY }, currentRoom.walls)) { nextX = potX; moved = true; }
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
      const potX = nextX + speed;
      if (!checkCollision({ x: potX, y: nextY }, currentRoom.walls)) { nextX = potX; moved = true; }
    }
    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w')) {
      const potY = nextY - speed;
      if (!checkCollision({ x: nextX, y: potY }, currentRoom.walls)) { nextY = potY; moved = true; }
    }
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s')) {
      const potY = nextY + speed;
      if (!checkCollision({ x: nextX, y: potY }, currentRoom.walls)) { nextY = potY; moved = true; }
    }

    if (!moved) return;

    if (prev.currentRoomId === 12) {
      if (nextX > 72 && nextX < 88 && nextY > 55 && nextY < 85) {
        triggerTempleTransition(99, { x: 10, y: 48 });
        return;
      }
    }
    if (prev.currentRoomId === 99) {
      if (nextX < 6 && nextY > 34 && nextY < 64) { 
        triggerTempleTransition(12, { x: 80, y: 88 });
        return;
      }
    }

    let nextRoomId = prev.currentRoomId;
    let transitioned = false;

    if (nextX < -PLAYER_SIZE / 2 && currentRoom.exits.left !== undefined) {
      nextRoomId = currentRoom.exits.left; nextX = CANVAS_WIDTH - PLAYER_SIZE - 6; transitioned = true;
    } else if (nextX > CANVAS_WIDTH - PLAYER_SIZE / 2 && currentRoom.exits.right !== undefined) {
      nextRoomId = currentRoom.exits.right; nextX = 6; transitioned = true;
    } else if (nextY < -PLAYER_SIZE / 2 && currentRoom.exits.up !== undefined) {
      nextRoomId = currentRoom.exits.up; nextY = CANVAS_HEIGHT - PLAYER_SIZE - 6; transitioned = true;
    } else if (nextY > CANVAS_HEIGHT - PLAYER_SIZE / 2 && currentRoom.exits.down !== undefined) {
      nextRoomId = currentRoom.exits.down; nextY = 6; transitioned = true;
    }

    if (transitioned) {
      setTransitionColor('255, 255, 255');
      setFlashOpacity(0.3);
    }

    nextX = Math.max(-PLAYER_SIZE, Math.min(CANVAS_WIDTH, nextX));
    nextY = Math.max(-PLAYER_SIZE, Math.min(CANVAS_HEIGHT, nextY));

    audioService.playStep();

    let showDialog = prev.showDialog;
    let dialogText = prev.dialogText;
    let isWaitingForChoice = prev.isWaitingForChoice;

    const nextRoom = worldRef.current.find(r => r.id === nextRoomId);
    if (nextRoom?.npc) {
      const dist = Math.sqrt(Math.pow(nextX - nextRoom.npc.x, 2) + Math.pow(nextY - nextRoom.npc.y, 2));
      if (!showDialog && dist < 15) {
        showDialog = true; 
        dialogText = prev.isAccepted || prev.isRejected || !nextRoom.npc.name || nextRoom.npc.color === "transparent" 
          ? nextRoom.npc.text 
          : `${nextRoom.npc.name}: "${nextRoom.npc.text}"`;
      } else if (showDialog && dist > 20) { showDialog = false; }
    }

    if (nextRoom?.hasEntity && !prev.isEntityDead && !prev.isAccepted) {
      const dist = Math.sqrt(Math.pow(nextX - 80, 2) + Math.pow(nextY - 48, 2));
      if (!showDialog && dist < 25) {
        showDialog = true; isWaitingForChoice = true;
        dialogText = "Mas, quanto a você,\nencherei de riso a sua boca\ne de brados de alegria os seus lábios...\n\nVocê só precisa me dar tudo.\n\n[S] Sim    [N] Não";
        audioService.playEntity();
      }
    }

    if (transitioned && nextRoom?.message) {
      showDialog = true; dialogText = nextRoom.message;
      setTimeout(() => setGameState(cur => ({ ...cur, showDialog: false })), 3000);
    }

    setGameState({ ...prev, playerPos: { x: nextX, y: nextY }, currentRoomId: nextRoomId, showDialog, dialogText, isWaitingForChoice });
  }, [acceptanceProgress, isTempleTransitioning, triggerTempleTransition]);

  const renderIntro = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Efeito de Rainbow Atari no título
    const title = "AWASHIMAURA";
    const colors = ['#f00', '#f80', '#ff0', '#0f0', '#00f', '#80f'];
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < title.length; i++) {
      const charColor = colors[(Math.floor(time / 200) + i) % colors.length];
      ctx.fillStyle = charColor;
      ctx.fillText(title[i], (CANVAS_WIDTH / 2 - 40) + (i * 8), 40);
    }

    // Texto de ação piscante
    if (Math.floor(time / 500) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px Courier New';
      ctx.fillText("PRESSIONE ESPAÇO", CANVAS_WIDTH / 2, 70);
    }

    ctx.fillStyle = '#444';
    ctx.font = '6px Courier New';
    ctx.fillText("© 1982 VOID SYSTEMS", CANVAS_WIDTH / 2, 85);

    // Efeito de scanline atari
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < CANVAS_HEIGHT; i += 2) {
      ctx.fillRect(0, i, CANVAS_WIDTH, 1);
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = stateRef.current;
    const time = Date.now();

    if (state.isIntro) {
      renderIntro(ctx, time);
      return;
    }

    if (state.isGameOver) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return; }
    const room = worldRef.current.find(r => r.id === state.currentRoomId);
    if (!room) return;

    ctx.save();
    const currentShake = acceptanceProgress > 0 ? acceptanceProgress * 12 : shake;
    if (currentShake > 0) ctx.translate((Math.random() - 0.5) * currentShake, (Math.random() - 0.5) * currentShake);

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    room.decor.forEach(d => { 
      // Animação da Praia exclusiva para a Sala 29
      if (state.isAccepted && state.currentRoomId === 29) {
        const tide = Math.sin(time / 1500) * 4;
        
        if (d.color === '#0066cc') {
          ctx.fillStyle = d.color;
          ctx.fillRect(d.x, d.y, d.w, d.h + tide);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          for (let i = 0; i < 5; i++) {
            const sx = (Math.sin(time / 400 + i) * 70) + 80;
            const sy = d.y + 5 + (Math.cos(time / 600 + i) * 15);
            ctx.fillRect(sx, sy, 1, 1);
          }
          return;
        }
        
        if (d.color === '#FFF') {
          const shimmer = Math.sin(time / 300) * 1;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(d.x, d.y + tide + shimmer, d.w, d.h);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(d.x, d.y + tide + shimmer + 2, d.w, 1);
          
          for (let i = 0; i < 3; i++) {
            const fx = (time / 10 + i * 50) % CANVAS_WIDTH;
            ctx.fillRect(fx, d.y + tide + shimmer - 1, 1, 1);
          }
          return;
        }
      }

      if (d.color === '#ffb7c5' && state.isAccepted) {
        const swayX = Math.sin(time / 600 + d.x) * 2;
        const swayY = Math.cos(time / 800 + d.y) * 2;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x + swayX, d.y + swayY, d.w, d.h);
        return;
      }

      // Efeito de pulsação de luz para o reator (Sala 100 Rejected)
      if (state.isRejected && state.currentRoomId === 100 && d.color === '#00ff00') {
          const glowIntensity = Math.abs(Math.sin(time / 400)) * 0.6 + 0.4;
          const beamWidth = Math.abs(Math.sin(time / 800)) * 15;
          
          // Brilho Radial Simulado
          ctx.fillStyle = `rgba(0, 255, 0, ${glowIntensity * 0.25})`;
          ctx.fillRect(d.x - 6 - beamWidth/2, d.y - 6 - beamWidth/2, d.w + 12 + beamWidth, d.h + 12 + beamWidth);
          
          // Luz Central Intensa
          ctx.fillStyle = `rgba(200, 255, 200, ${glowIntensity})`;
          ctx.fillRect(d.x, d.y, d.w, d.h);
          return;
      }

      ctx.fillStyle = d.color; 
      ctx.fillRect(d.x, d.y, d.w, d.h); 
    });

    if (state.isAccepted) {
      const auraPulse = Math.abs(Math.sin(time / 2000)) * 0.15;
      ctx.fillStyle = `rgba(255, 230, 200, ${auraPulse})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for(let i=0; i<10; i++) {
        const px = (Math.sin(time/1000 + i * 2) * 80) + 80;
        const py = (Math.cos(time/1500 + i * 3) * 45) + 48;
        ctx.fillRect(px, py, 1, 1);
      }
    }

    room.walls.forEach(w => { 
      if (w.color !== 'transparent') {
        ctx.fillStyle = w.color; ctx.fillRect(w.x, w.y, w.w, w.h); 
      }
    });

    if (room.npc && room.npc.color !== "transparent") {
      const npcPulse = Math.abs(Math.sin(time / 300)) * 30;
      if (state.isAccepted) {
        const driftX = Math.sin(time / 600) * 1.5;
        ctx.fillStyle = room.npc.color;
        ctx.fillRect(room.npc.x + driftX, room.npc.y, PLAYER_SIZE, PLAYER_SIZE);
      } else {
        const isGlitching = Math.random() > 0.93;
        let npcX = room.npc.x;
        let npcY = room.npc.y;
        
        if (isGlitching) {
          npcX += (Math.random() - 0.5) * 4;
          npcY += (Math.random() - 0.5) * 4;
          ctx.fillStyle = state.isRejected ? '#FF0000' : '#00FFFF';
        } else {
          ctx.fillStyle = `rgb(${30 + npcPulse}, ${30 + npcPulse}, ${30 + npcPulse})`;
        }
        ctx.fillRect(npcX, npcY, PLAYER_SIZE, PLAYER_SIZE);

        for(let p=0; p<4; p++) {
          const angle = (time / 400) + (p * Math.PI / 2);
          const px = npcX + Math.cos(angle) * (6 + Math.sin(time/150)*2);
          const py = npcY + Math.sin(angle) * (6 + Math.cos(time/150)*2);
          ctx.fillStyle = Math.random() > 0.5 ? '#111' : '#333';
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }

    if (room.hasEntity && !state.isEntityDead && !state.isAccepted) {
      const dx = state.playerPos.x - 80;
      const dy = state.playerPos.y - 48;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isNear = dist < 50;
      const isVeryNear = dist < 25;

      const flickerRate = isVeryNear ? 25 : (isNear ? 40 : 60);
      const pulseRate = isVeryNear ? 60 : 150;
      const pulse = Math.sin(time / pulseRate) * (isNear ? 10 : 6);
      const size = (22 + pulse) * (1 + acceptanceProgress * 5);

      if (isNear) {
        const colors = [ENTITY_COLOR, '#FFF', '#00FFFF', '#FF0000', '#FFFF00', '#00FF00'];
        ctx.fillStyle = colors[Math.floor(time / flickerRate) % colors.length];
        const jitter = isVeryNear ? 4 : 1.5;
        const jX = (Math.random() - 0.5) * jitter;
        const jY = (Math.random() - 0.5) * jitter;
        ctx.fillRect(80 - size / 2 + jX, 48 - size / 2 + jY, size, size);
        if (isVeryNear && Math.random() > 0.85) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          if (Math.random() > 0.5) {
            ctx.fillRect(0, Math.random() * CANVAS_HEIGHT, CANVAS_WIDTH, 1);
          } else {
            ctx.fillRect(Math.random() * CANVAS_WIDTH, 0, 1, CANVAS_HEIGHT);
          }
        }
      } else {
        ctx.fillStyle = (Math.floor(time / flickerRate) % 2 === 0) ? ENTITY_COLOR : '#FFF';
        ctx.fillRect(80 - size / 2, 48 - size / 2, size, size);
      }
    }

    ctx.fillStyle = (state.isRejected && Math.random() > 0.95) ? '#FF0000' : PLAYER_COLOR;
    ctx.fillRect(state.playerPos.x, state.playerPos.y, PLAYER_SIZE, PLAYER_SIZE);

    // Efeitos Digitais / Radiação no Laboratório
    if (state.isRejected && (state.currentRoomId === 99 || state.currentRoomId === 100)) {
        // Partículas de radiação
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
        for(let i=0; i<8; i++) {
            const rx = (Math.sin(time/500 + i) * 80) + 80 + (Math.random() - 0.5) * 20;
            const ry = (Math.cos(time/700 + i) * 48) + 48 + (Math.random() - 0.5) * 20;
            ctx.fillRect(rx, ry, 1, 1);
        }
        
        if (Math.random() > 0.9) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
            ctx.fillRect(Math.random() * CANVAS_WIDTH, 0, 1, CANVAS_HEIGHT);
        }
        if (Math.random() > 0.98) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, Math.random() * CANVAS_HEIGHT, CANVAS_WIDTH, 2);
        }
        
        // Intensifica o shake perto do reator na sala 100
        if (state.currentRoomId === 100) {
            const distToCore = Math.sqrt(Math.pow(state.playerPos.x - 80, 2) + Math.pow(state.playerPos.y - 48, 2));
            if (distToCore < 40 && Math.random() > 0.8) {
               ctx.translate((Math.random()-0.5)*2, (Math.random()-0.5)*2);
            }
        }
    }

    if (flashOpacity > 0) { 
      ctx.fillStyle = `rgba(${transitionColor}, ${flashOpacity})`; 
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); 
      if (isTempleTransitioning) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity * 0.5})`;
        for(let i=0; i<5; i++) {
           ctx.fillRect(Math.random()*CANVAS_WIDTH, Math.random()*CANVAS_HEIGHT, 1, 1);
        }
      }
    }
    
    if (redFlashOpacity > 0) { ctx.fillStyle = `rgba(255, 0, 0, ${redFlashOpacity})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }

    ctx.restore();
  }, [flashOpacity, redFlashOpacity, shake, acceptanceProgress, isTempleTransitioning, transitionColor]);

  const update = useCallback(() => {
    movePlayer();
    if (!isTempleTransitioning) setFlashOpacity(prev => Math.max(0, prev - 0.05));
    setRedFlashOpacity(prev => Math.max(0, prev - 0.05));
    setShake(prev => Math.max(0, prev - 0.5));
    if (acceptanceProgress > 0 && acceptanceProgress < 1) setAcceptanceProgress(prev => Math.min(1, prev + 0.015));
    render();
    requestRef.current = requestAnimationFrame(update);
  }, [movePlayer, render, acceptanceProgress, isTempleTransitioning]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current !== null) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const state = stateRef.current;
      
      if (state.isIntro) {
        if (e.code === 'Space' || e.key === 'Enter') {
          audioService.playStep();
          setGameState(prev => ({ ...prev, isIntro: false }));
        }
        return;
      }

      if (state.isWaitingForChoice && acceptanceProgress === 0) {
        if (key === 's') {
          audioService.playReset(); setAcceptanceProgress(0.01);
          setTimeout(() => { 
            setGameState(prev => ({ ...prev, currentRoomId: 0, playerPos: { x: 20, y: 45 }, cycle: prev.cycle + 1, isAccepted: true, showDialog: false, isWaitingForChoice: false, visitedRooms: [0] })); 
            setAcceptanceProgress(0); setFlashOpacity(1.0); 
          }, 1500);
        } else if (key === 'n') {
          audioService.playWallHit(); setShake(8); setRedFlashOpacity(0.8);
          setGameState(prev => ({ ...prev, isRejected: true, isEntityDead: true, showDialog: false, isWaitingForChoice: false }));
        }
        return;
      }
      keysPressed.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [acceptanceProgress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] overflow-hidden">
      <div className="relative border-8 border-[#1a1a1a] rounded-sm shadow-[0_0_150px_rgba(0,0,0,1)]">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ width: CANVAS_WIDTH * SCALE, height: CANVAS_HEIGHT * SCALE }} />
        {!gameState.isIntro && gameState.showDialog && acceptanceProgress === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`p-6 border-2 max-w-[80%] shadow-2xl transition-colors duration-500 ${gameState.isRejected ? 'bg-red-950/95 border-red-500/30' : (gameState.isAccepted ? 'bg-amber-950/95 border-amber-500/30' : 'bg-black/95 border-white/10')}`}>
              <p className={`text-sm md:text-lg leading-relaxed whitespace-pre-wrap font-mono text-center tracking-tight animate-pulse ${gameState.isRejected ? 'text-red-500' : (gameState.isAccepted ? 'text-amber-200' : 'text-white')}`}>
                {gameState.dialogText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
