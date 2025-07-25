import { v1 } from "uuid";
import {
  AntIcon,
  BeetleIcon,
  GrasshopperIcon,
  QueenIcon,
  SpiderIcon,
} from "../components/Svgs";
import { toast } from "react-toastify";
import ReactDOMServer from "react-dom/server";
import React from "react";

export enum GAME_PIECE_TYPE {
  QUEEN = "queen",
  ANT = "ant",
  SPIDER = "spider",
  BEETLE = "beetle",
  GRASSHOPPER = "grasshopper",
}

export interface HexDirection {
  q: number;
  r: number;
  z: number;
}

const hashPosToKey = (pos: HexDirection) => {
  return `${pos.q},${pos.r},${pos.z}`;
};

export interface GamePieceConstructor {
  id?: string;
  pos: HexDirection;
  type: GAME_PIECE_TYPE;
  info?: Info;
  ownerId: string;
  state?: PIECE_STATE;
}

const ValidAntMove = (
  board: Board,
  currentPiece: GamePiece,
  to: HexDirection
): boolean => {
  if (board.pieces.has(hashPosToKey(to))) return false;
  const moveAnt = (
    board: Board,
    currentPos: HexDirection,
    finalPos: HexDirection,
    alreadyVisited: HexDirection[]
  ): boolean[] => {
    if (
      alreadyVisited.some(
        (pos) =>
          pos.q == currentPos.q &&
          pos.r == currentPos.r &&
          pos.z == currentPos.z
      )
    ) {
      return [false];
    }
    if (
      !board
        .getNeighbors(currentPos)
        ?.some(
          (p) => p?.state === PIECE_STATE.BOARD && p?.id != currentPiece.id
        )
    ) {
      return [false];
    }
    if (
      currentPos.q == finalPos.q &&
      currentPos.r == finalPos.r &&
      currentPos.z == finalPos.z
    ) {
      // let increment = 1;
      // alreadyVisited.forEach(pos => {
      //   setTimeout(() => {
      //     if(!board.pieces.has(hashPosToKey(pos))) {
      //       let incremente2 = 1;
      //       board.placePiece({
      //         pos: pos,
      //         type: GAME_PIECE_TYPE.ANT,
      //         ownerId: currentPiece.ownerId,
      //         state: PIECE_STATE.BOARD,
      //       });
      //       setTimeout(() => {
      //           board.pieces.delete(hashPosToKey(pos));
      //       }, incremente2 * 300);
      //       incremente2++;
      //     }
      //   }, increment * 200);
      //   increment++;
      // })
      return [true];
    }
    alreadyVisited.push(currentPos); // Add current position to already visited
    const moves: boolean[] = hexDirections.map((dir) => {
      const nextPos = {
        q: currentPos.q + dir.q,
        r: currentPos.r + dir.r,
        z: currentPos.z,
      };
      if (
        board.pieces.has(hashPosToKey(nextPos)) ||
        !board.canSlide(currentPos, nextPos, currentPiece.type, currentPiece.id)
      ) {
        return false;
      }
      const newMoves = moveAnt(board, nextPos, finalPos, alreadyVisited);
      return newMoves.some((move) => move);
    });
    alreadyVisited.pop();
    return moves;
  };
  const alreadyVisited: HexDirection[] = [];
  const moves = moveAnt(board, currentPiece.pos, to, alreadyVisited);
  return moves.some((move) => move);
};

const ValidBeetleMove = (
  board: Board,
  currentPiece: GamePiece,
  to: HexDirection
): boolean => {
  return hexDirections.some((dir) => {
    const nextPos = {
      q: currentPiece.pos.q + dir.q,
      r: currentPiece.pos.r + dir.r,
      z: 1,
    };
    if (to.q == nextPos.q && to.r == nextPos.r && to.z == nextPos.z) {
      // Se a posição de destino é a posição de destino
      if (board.pieces.has(GamePiece.hashPosToKey(nextPos))) {
        // Está subindo em cima, então é um movimento válido
        return true;
      } else if (currentPiece.pos.z > 1) {
        // Está descendo, portanto consegue se mover
        return true;
      } else if (board.canSlide(currentPiece.pos, nextPos, currentPiece.type)) {
        return true;
      }
    }
    return false;
  });
};

const ValidGrasshopperMove = (
  board: Board,
  currentPiece: GamePiece,
  to: HexDirection
): boolean => {
  if (board.pieces.has(hashPosToKey(to))) return false;
  return Object.entries(hexDirectionsCardinal).some(([_key, dir]) => {
    const nextPos = {
      q: currentPiece.pos.q + dir.q,
      r: currentPiece.pos.r + dir.r,
      z: 1,
    };
    if (nextPos.q == to.q && nextPos.r == to.r) {
      // Se mover apenas uma vez e chegar no destino é pq não pulou por cima de nenhuma peça
      return false;
    }
    while (board.pieces.has(GamePiece.hashPosToKey(nextPos))) {
      nextPos.q += dir.q;
      nextPos.r += dir.r;
    }
    if (nextPos.q == to.q && nextPos.r == to.r) {
      return true;
    }
    return false;
  });
};

const ValidQueenMove = (
  board: Board,
  currentPiece: GamePiece,
  to: HexDirection
): boolean => {
  if (board.pieces.has(hashPosToKey(to))) return false;
  return hexDirections.some((dir) => {
    const nextPos = {
      q: currentPiece.pos.q + dir.q,
      r: currentPiece.pos.r + dir.r,
      z: 1,
    };
    if (to.q == nextPos.q && to.r == nextPos.r && to.z == nextPos.z) {
      // Se a posição de destino é a posição de destino
      if (board.pieces.has(GamePiece.hashPosToKey(nextPos))) {
        // Está subindo em cima, então não é um movimento válido
        return false;
      } else if (
        !board.canSlide(currentPiece.pos, nextPos, currentPiece.type)
      ) {
        return false;
      }
      return true;
    }
    return false;
  });
};

const ValidSpiderMove = (
  board: Board,
  currentPiece: GamePiece,
  to: HexDirection
): boolean => {
  if (board.pieces.has(hashPosToKey(to))) return false;
  const moveSpider = (
    board: Board,
    currentPos: HexDirection,
    finalPos: HexDirection,
    alreadyVisited: HexDirection[],
    currentMoves: number
  ): boolean[] => {
    if (currentMoves > 3) {
      return [false];
    }
    if (
      alreadyVisited.some(
        (pos) =>
          pos.q == currentPos.q &&
          pos.r == currentPos.r &&
          pos.z == currentPos.z
      )
    ) {
      return [false];
    }
    if (
      !board
        .getNeighbors(currentPos)
        ?.some(
          (p) => p?.state === PIECE_STATE.BOARD && p?.id != currentPiece.id
        )
    ) {
      return [false]; // Alguem vizinho diferente dela mesmo.
    }
    if (
      currentPos.q == finalPos.q &&
      currentPos.r == finalPos.r &&
      currentPos.z == finalPos.z &&
      currentMoves == 3
    ) {
      // let increment = 1;
      // alreadyVisited.forEach(pos => {
      //   setTimeout(() => {
      //     if(!board.pieces.has(hashPosToKey(pos))) {
      //       let incremente2 = 1;
      //       board.placePiece({
      //         pos: pos,
      //         type: GAME_PIECE_TYPE.SPIDER,
      //         ownerId: currentPiece.ownerId,
      //         state: PIECE_STATE.BOARD,
      //       });
      //       setTimeout(() => {
      //           board.pieces.delete(hashPosToKey(pos));
      //       }, incremente2 * 300);
      //       incremente2++;
      //     }
      //   }, increment * 200);
      //   increment++;
      // })
      return [true];
    }
    alreadyVisited.push(currentPos); // Add current position to already visited
    const moves: boolean[] = hexDirections.map((dir) => {
      const nextPos = {
        q: currentPos.q + dir.q,
        r: currentPos.r + dir.r,
        z: currentPos.z,
      };
      if (
        board.pieces.has(hashPosToKey(nextPos)) ||
        !board.canSlide(currentPos, nextPos, currentPiece.type, currentPiece.id)
      ) {
        return false;
      }
      const newMoves = moveSpider(
        board,
        nextPos,
        finalPos,
        alreadyVisited,
        currentMoves + 1
      );
      return newMoves.some((move) => move);
    });
    alreadyVisited.pop();
    return moves;
  };
  const alreadyVisited: HexDirection[] = [];
  const moves = moveSpider(board, currentPiece.pos, to, alreadyVisited, 0);
  return moves.some((move) => move);
};

const gamePieceMovements: Record<
  GAME_PIECE_TYPE,
  (board: Board, currentPiece: GamePiece, to: HexDirection) => boolean
> = {
  ant: ValidAntMove,
  beetle: ValidBeetleMove,
  grasshopper: ValidGrasshopperMove,
  queen: ValidQueenMove,
  spider: ValidSpiderMove,
};

export interface Info {
  title: string;
  subtitle?: string;
  movement: string;
}

export const piecesInfo: Record<GAME_PIECE_TYPE, Info> = {
  ant: {
    movement: "It can move anywhere on the hive using the outside!",
    title: "Ant",
    subtitle:
      "Unstoppable force, it can move anywhere with unlimited movement.",
  },
  beetle: {
    movement:
      "Can move only one space! It can sit on top of other piece and block their movement!",
    title: "Beetle",
    subtitle: "Heavy wheight class, it can sit on top of others.",
  },
  grasshopper: {
    movement:
      "Can jump over many pieces as want, you must choose one direction and jump!",
    title: "Grasshopper",
    subtitle: "The jumper, doesn't metter your height, it can jump over.",
  },
  queen: {
    movement:
      "Can move only one piece! Must be positioned at most on the 4º round.",
    title: "Queen",
    subtitle: "The QUEEN, you must protect it with all your will and power!",
  },
  spider: {
    movement: "Move 3 piecies of distance.",
    title: "Spider",
    subtitle: "The trapper, when you least expect, it is there.",
  },
};

export const hexDirections: HexDirection[] = [
  { q: 1, r: 0, z: 1 },
  { q: 1, r: -1, z: 1 },
  { q: 0, r: -1, z: 1 },
  { q: -1, r: 0, z: 1 },
  { q: -1, r: 1, z: 1 },
  { q: 0, r: 1, z: 1 },
];

export const hexDirectionsCardinal: Record<string, HexDirection> = {
  LESTE: { q: 1, r: 0, z: 1 },
  NORDESTE: { q: 1, r: -1, z: 1 },
  NOROESTE: { q: 0, r: -1, z: 1 },
  OESTE: { q: -1, r: 0, z: 1 },
  SUDOESTE: { q: -1, r: 1, z: 1 },
  SUDESTE: { q: 0, r: 1, z: 1 },
};

interface Drag {
  isDragging: boolean;
  isMoving: boolean;
  offSet: {
    x: number;
    y: number;
  };
}

export const PIECE_TYPE_IMAGES: Record<GAME_PIECE_TYPE, React.FC> = {
  [GAME_PIECE_TYPE.ANT]: AntIcon,
  [GAME_PIECE_TYPE.BEETLE]: BeetleIcon,
  [GAME_PIECE_TYPE.GRASSHOPPER]: GrasshopperIcon,
  [GAME_PIECE_TYPE.QUEEN]: QueenIcon,
  [GAME_PIECE_TYPE.SPIDER]: SpiderIcon,
};

export const enum PIECE_STATE {
  BOARD = "board",
  PLAYER = "player",
}

interface GamePieceMinified {
  id: string;
  ownerId: string;
  pos: HexDirection;
  type: GAME_PIECE_TYPE;
  state: PIECE_STATE;
}

export class GamePiece {
  public id: string;
  public ownerId: string;
  public pos: HexDirection;
  public type: GAME_PIECE_TYPE;
  public info: Info;
  public state: PIECE_STATE;
  public draggable: Drag = {
    isDragging: false,
    isMoving: false,
    offSet: {
      x: 0,
      y: 0,
    },
  };
  public validMovement: (
    board: Board,
    currentPiece: GamePiece,
    to: HexDirection
  ) => boolean;
  public possibleMoves: HexDirection[] | null = null;

  constructor(args: GamePieceConstructor) {
    this.id = args.id ? args.id : v1();
    this.pos = args.pos;
    this.type = args.type;
    this.info = args.info ? args.info : piecesInfo[this.type];
    this.validMovement = (
      board: Board,
      currentPiece: GamePiece,
      to: HexDirection
    ) => {
      return currentPiece.pos.q === to.q && currentPiece.pos.r === to.r
        ? false
        : gamePieceMovements[this.type](board, currentPiece, to);
    };
    this.ownerId = args.ownerId;
    this.state = args.state ? args.state : PIECE_STATE.PLAYER;
  }

  static hashPosToKey(pos: HexDirection) {
    return `${pos.q},${pos.r},${pos.z}`;
  }

  static getPieceIcon(type: GAME_PIECE_TYPE) {
    return PIECE_TYPE_IMAGES[type];
  }

  canDrag(id: string) {
    return id === this.ownerId;
  }

  canMove(board: Board) {
    const possiblePositions = new Map<string, HexDirection>();
    Array.from(board.pieces.values()).forEach((p) => {
      hexDirections.forEach((dir) => {
        const pos: HexDirection = {
          q: p.pos.q + dir.q,
          r: p.pos.r + dir.r,
          z: 1,
        };
        possiblePositions.set(hashPosToKey(pos), pos);
      });
    });
    const canMove: boolean = Array.from(possiblePositions.values()).some(
      (dir) => {
        const valid = this.validMovement(board, this, dir);
        return valid;
      }
    );

    return canMove;
  }

  getPossibleMoves(board: Board): HexDirection[] {
    if (this.possibleMoves) return this.possibleMoves;

    if (board.getPlayer(board.currentPlayer).firstMove) {
      if (board.p1.id === board.currentPlayer) {
        if (board.p2.firstMove) {
          return [{ q: 0, r: 0, z: 1 }];
        } else {
          return hexDirections;
        }
      } else {
        if (board.p1.firstMove) {
          return [{ q: 0, r: 0, z: 1 }];
        } else {
          return hexDirections;
        }
      }
    }

    const currentPlayer = board.getPlayer(board.currentPlayer);
    if (
      currentPlayer.moveCount === 3 &&
      this.type !== GAME_PIECE_TYPE.QUEEN &&
      Array.from(board.pieces.values()).some(
        (p) =>
          p.type === GAME_PIECE_TYPE.QUEEN &&
          p.ownerId === currentPlayer.id &&
          p.state === PIECE_STATE.PLAYER
      )
    ) {
      this.possibleMoves = [];
      return this.possibleMoves;
    }

    if (
      this.state === PIECE_STATE.BOARD &&
      (board.brokeBoard(this) ||
        Object.values(Object.fromEntries(board.pieces)).some(
          (p) =>
            p.ownerId === currentPlayer.id &&
            p.type === GAME_PIECE_TYPE.QUEEN &&
            p.state === PIECE_STATE.PLAYER
        ))
    ) {
      this.possibleMoves = [];
      return this.possibleMoves;
    }

    let possibleMoves: HexDirection[] = [];

    if (this.state === PIECE_STATE.PLAYER) {
      const pieces = Array.from(board.pieces.values()).filter(
        (p) =>
          p.ownerId === this.ownerId &&
          p.state === PIECE_STATE.BOARD &&
          p.id !== this.id
      );
      hexDirections.forEach((dir) => {
        pieces.forEach((p) => {
          const d: HexDirection = {
            q: p.pos.q + dir.q,
            r: p.pos.r + dir.r,
            z: 1,
          };
          if (!board.pieces.has(hashPosToKey(d))) {
            if (!board.getNeighbors(d)?.some((n) => n.ownerId !== this.ownerId))
              if (!possibleMoves.find((pm) => pm.q === d.q && pm.r === d.r))
                possibleMoves.push(d);
          }
        });
      });
      this.possibleMoves = possibleMoves;
      return this.possibleMoves;
    }

    const possiblePositions = new Map<string, HexDirection>();
    Array.from(board.pieces.values()).forEach((p) => {
      hexDirections.forEach((dir) => {
        const pos: HexDirection = {
          q: p.pos.q + dir.q,
          r: p.pos.r + dir.r,
          z: 1,
        };
        possiblePositions.set(hashPosToKey(pos), pos);
      });
    });

    Array.from(possiblePositions.values()).some((dir) => {
      const valid = this.validMovement(board, this, dir);
      if (
        valid &&
        !possibleMoves.find((pm) => pm.q === dir.q && pm.r === dir.r)
      ) {
        if (this.type === GAME_PIECE_TYPE.BEETLE) {
          while (board.pieces.has(hashPosToKey(dir))) dir.z++;
        }
        possibleMoves.push(dir);
      }
    });
    this.possibleMoves = possibleMoves;
    return this.possibleMoves;
  }

  static dragBack(piece: GamePiece, x: number, y: number) {
    piece.draggable.isMoving = true;
    const timer = 20;
    const interval = setInterval(() => {
      const xV = (Math.abs(piece.draggable.offSet.x) - Math.abs(x)) / timer;
      const yV = (Math.abs(piece.draggable.offSet.y) - Math.abs(y)) / timer;
      piece.draggable.offSet.x =
        piece.draggable.offSet.x > 0
          ? piece.draggable.offSet.x - xV
          : piece.draggable.offSet.x + xV;
      piece.draggable.offSet.y =
        piece.draggable.offSet.y > 0
          ? piece.draggable.offSet.y - yV
          : piece.draggable.offSet.y + yV;
      if (
        Math.abs(piece.draggable.offSet.x - x) < 10 &&
        Math.abs(piece.draggable.offSet.y - y) < 10
      ) {
        clearInterval(interval);
        piece.draggable.offSet = { x: 0, y: 0 };
        piece.draggable.isMoving = false;
      }
    }, timer / 1000);
  }
}

export enum PLAYER_TYPE {
  PLAYER = "player",
  ROBOT = "robot",
}

export interface GamePlayerConstructor {
  id?: string;
  username: string;
  type: PLAYER_TYPE;
  firstMove?: boolean;
  moveCount?: number;
  canMove?: boolean;
  time: number;
}

export class GamePlayer {
  public id: string;
  public username: string;
  public type: PLAYER_TYPE;
  public firstMove: boolean;
  public moveCount: number;
  public canMove: boolean;
  public time: number;

  constructor(args: GamePlayerConstructor) {
    this.id = args.id ? args.id : v1();
    this.username = args.username;
    this.type = args.type;
    this.firstMove = args.firstMove ? args.firstMove : true;
    this.moveCount = args.moveCount ? args.moveCount : 0;
    this.canMove = args.canMove !== undefined ? args.canMove : true;
    this.time = args.time;
  }
}

export enum GAME_MODE {
  LOCAL = "local",
  ONLINE = "online",
  CPU = "cpu",
}

export function pretifyGameMode(gameMode: GAME_MODE) {
  const pretify: Record<GAME_MODE, string> = {
    local: "Player vs Player (LOCAL)",
    cpu: "PLAYER vs MACHINE",
    online: "Player vs Player (ONLINE)",
  };
  return pretify[gameMode];
}

export enum GAME_DIFFICULTY {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  EXPERT = "expert",
}

export function pretifyGameDifficulty(gameDifficulty: GAME_DIFFICULTY) {
  const pretify: Record<GAME_DIFFICULTY, string> = {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    expert: "Expert",
  };
  return pretify[gameDifficulty];
}

export enum GAME_STATE {
  WAITING = "waiting", // Esperando jogo começar
  PAUSED = "paused", // Jogo pausou
  FINISHED = "finished", // Terminou
  PLAYING = "playing", // Jogando
  CALCULATING = "calculating", // Calculando jogada
}

export function pretifyGameState(gameState: GAME_STATE) {
  const pretify: Record<GAME_STATE, string> = {
    waiting: "START",
    paused: "PAUSED",
    finished: "GAME FINISHED",
    playing: "...PLAYING...",
    calculating: "...CALCULATING...",
  };
  return pretify[gameState];
}

export interface BoardConstructor {
  id?: string;
  pieces?: Map<string, GamePiece>;
  mode: GAME_MODE;
  p1: GamePlayer;
  p2: GamePlayer;
  difficulty: GAME_DIFFICULTY;
  state?: GAME_STATE;
  currentPlayer?: string;
  playerTimer?: number;
  timerConfig: GAME_TIMER;
}

type pos = { x: number; y: number };

export enum GAME_TIMER {
  BULLET = "bullet",
  SPEED = "speed",
  CLASSIC = "classic",
}

interface GAME_TIMER_STATS {
  timer: number;
  title: string;
  pretify: string;
}

export const gameTimerStats: Record<GAME_TIMER, GAME_TIMER_STATS> = {
  bullet: {
    timer: 60 * 2,
    title: "Bullet",
    pretify: "2 minutes",
  },
  speed: {
    timer: 60 * 5,
    title: "Speed",
    pretify: "5 minutes",
  },
  classic: {
    timer: 60 * 10,
    title: "Classic",
    pretify: "10 minutes",
  },
};

export type GameHookState = {
  state: GAME_STATE;
  difficulty: GAME_DIFFICULTY;
  currentPlayer: GamePlayer;
  playerTimer: number;
};

export type GameHook = (args: GameHookState) => void;

type GameTree = {
  value: string; //GameState map id
  player: string;
  active: boolean;
  children?: GameTree[];
  p1: {
    firstMove: boolean;
  };
  p2: {
    firstMove: boolean;
  };
};

type MinimaxGameTree = GameTree & {
  heuristicValue: number;
  children?: MinimaxGameTree[];
};

type AlfaBetaGameTree = GameTree & {
  children?: AlfaBetaGameTree[];
  alphaBeta: number[];
};

export class Board {
  public id: string;
  public p1: GamePlayer;
  public p2: GamePlayer;
  public pieces: Map<string, GamePiece>;
  public difficulty: GAME_DIFFICULTY;
  private playerTimer: number;
  public state: GAME_STATE;
  public mode: GAME_MODE;
  private hooks: GameHook[] = [];
  private winner: string = "";
  public timerRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null> = { current: null };
  public currentCanva: HTMLCanvasElement | null = null;
  public HEX_SIZE: number = 30;
  public HEX_WIDTH: number = Math.sqrt(3) * this.HEX_SIZE;
  public HEX_HEIGHT: number = 2 * this.HEX_SIZE;
  public currentPlayer: string;
  public mousePos: pos & { state: PIECE_STATE } = {
    x: 0,
    y: 0,
    state: PIECE_STATE.BOARD,
  };
  public divisoryBoard: number = 8 * 30;
  public timerConfig: GAME_TIMER;
  private heuristicPlayer: string | undefined = undefined;
  public offSet: pos = {
    x: 0,
    y: 0,
  };

  public gameStates: Map<string, GamePieceMinified[]> = new Map();
  public gameTree: GameTree | undefined;

  static pieceImages: Record<GAME_PIECE_TYPE, HTMLImageElement | null> = {
    ant: null,
    beetle: null,
    grasshopper: null,
    queen: null,
    spider: null,
  };

  static async preloadImages() {
    await Promise.all(
      Object.values(GAME_PIECE_TYPE).map((type) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          const IconComponent = PIECE_TYPE_IMAGES[type];

          if (!IconComponent) {
            console.error(`No component found for type: ${type}`);
            resolve();
            return;
          }

          try {
            const svgString = ReactDOMServer.renderToString(
              React.createElement(IconComponent)
            );

            const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
              URL.revokeObjectURL(url);
              Board.pieceImages[type] = img;
              resolve();
            };

            img.onerror = (e) => {
              console.error(`Error loading ${type}:`, e);
              resolve();
            };

            img.src = url;
          } catch (error) {
            console.error(`Error processing ${type}:`, error);
            resolve();
          }
        });
      })
    );
  }

  addHook(hook: GameHook) {
    this.hooks.push(hook);
  }

  constructor(args: BoardConstructor) {
    this.id = args.id ? args.id : v1();
    this.mode = args.mode;
    this.p1 = new GamePlayer(args.p1);
    this.p2 = new GamePlayer(args.p2);
    this.difficulty = args.difficulty;
    this.currentPlayer = args.currentPlayer ? args.currentPlayer : this.p1.id;
    this.state = args.state ? args.state : GAME_STATE.WAITING;
    this.timerConfig = args.timerConfig;
    this.playerTimer = gameTimerStats[args.timerConfig].timer;

    this.p1.time =
      this.p1.time > gameTimerStats[this.timerConfig].timer
        ? gameTimerStats[this.timerConfig].timer
        : this.p1.time;

    this.p2.time =
      this.p2.time > gameTimerStats[this.timerConfig].timer
        ? gameTimerStats[this.timerConfig].timer
        : this.p2.time;

    this.pieces = new Map<string, GamePiece>();

    if (args.pieces) {
      const piecesData: [string, GamePieceConstructor & { draggable: Drag }][] =
        args.pieces instanceof Map
          ? Array.from(args.pieces.entries())
          : Object.entries(args.pieces);

      piecesData.forEach(([key, pieceData]) => {
        const piece = new GamePiece({
          pos: pieceData.pos,
          type: pieceData.type,
          ownerId: pieceData.ownerId,
          state: pieceData.state,
          info: pieceData.info,
        });
        piece.draggable = pieceData.draggable;
        this.pieces.set(key, piece);
      });
    }
    this.render = this.render.bind(this);
  }

  loadState(state: GameTree) {
    const pieces = this.gameTreeToPieces(state);
    this.currentPlayer = state.player;
    this.p1.firstMove = state.p1.firstMove;
    this.p2.firstMove = state.p2.firstMove;
    this.pieces = pieces;
    //this.updateHooks()
  }

  static async minMax(board: Board, depth: number = 5): Promise<Board> {
    if (board.state === GAME_STATE.CALCULATING) return board;
    let state = { ...board.getLastTree() };
    if (!state) return board;
    let miniMaxState: MinimaxGameTree = {
      ...(state as GameTree),
      heuristicValue: 0,
      children: [],
    };
    board.setHeuristicPlayer();
    board.calculating();
    const initialChildren = board.genAllPossiblesStates();
    async function minMaxRecursivo(
      board: Board,
      state: MinimaxGameTree,
      currentDepth: number = 0,
      depth: number = 5,
      visited: Set<string>
    ): Promise<number | null> {
      if (visited.has(`${state.value}-${state.player}`)) return null;
      visited.add(`${state.value}-${state.player}`);
      board.loadState(state);

      if (currentDepth === depth) {
        return Board.getBoardHeuristicValue(board);
      }
      const type: "min" | "max" =
        board.currentPlayer === board.heuristicPlayer ? "max" : "min";
      state.children = board.genAllPossiblesStates().map((newState) => ({
        ...newState,
        heuristicValue: 0,
        children: [],
      }));

      if (state.children.length === 0) {
        // Apenas invertendo o estado pois jogador não possui jogadas válidas.
        const newPlayer =
          board.currentPlayer === board.p1.id ? board.p2.id : board.p1.id;
        const newState = {
          ...state,
          player: newPlayer,
        };
        board.currentPlayer = state.player;
        board.getPlayer(board.currentPlayer).moveCount++;
        const value = await minMaxRecursivo(
          board,
          newState,
          currentDepth + 1,
          depth,
          visited
        );
        board.currentPlayer = state.player;
        board.getPlayer(board.currentPlayer).moveCount--;
        return value;
      }
      const values: number[] = [];
      for (const move of state.children) {
        await new Promise(requestAnimationFrame);
        board.currentPlayer = state.player;
        board.getPlayer(board.currentPlayer).moveCount++;
        const value = await minMaxRecursivo(
          board,
          {
            ...move,
            heuristicValue: 0,
          },
          currentDepth + 1,
          depth,
          visited
        );
        if (value != null) {
          values.push(value);
        }
        board.currentPlayer = state.player;
        board.getPlayer(board.currentPlayer).moveCount--;
      }
      // Paralelismo: porém precisa criar um novo board, não vai autualizar
      // const values = await Promise.all(state.children.map(async move => {
      //   await new Promise(resolve => setTimeout(resolve, 0.000001));
      //   return minMaxRecursivo(board, move, currentDepth + 1, depth, new Set(visited))
      // }))

      const value =
        type === "max"
          ? Math.max(...values) // pegando maior elemento
          : Math.min(...values); // pegando menor elemento
      state.heuristicValue = value;
      return value;
    }
    let visited = new Set<string>();
    await minMaxRecursivo(board, miniMaxState, 0, depth, visited);
    const newState =
      miniMaxState.children && miniMaxState.children.length
        ? miniMaxState.children.reduce((prev, current) => {
            return (prev as MinimaxGameTree).heuristicValue >=
              (current as MinimaxGameTree).heuristicValue
              ? prev
              : current;
          })
        : null;
    const lastTree = board.getLastTree();
    if (newState && lastTree) {
      lastTree.children = initialChildren;
      lastTree.children?.forEach((s) => {
        if (s.value === newState.value) {
          s.active = true;
          board.getPlayer(board.currentPlayer).moveCount++;
          board.loadState(s);
          s.children = board.genAllPossiblesStates();
        }
      });
    } else board.loadState(state as GameTree);
    console.dir(board.gameTree, { depth: null });
    board.uncalculating();
    if (board.gameHasEnded()) {
      toast.info("THE GAME HAS FINISHED!!");
      if (board.winner === "") {
        toast.warning("The game ended with a DRAW :(");
        toast.info("Click on GAME FINISHED to restart the game!");
      } else {
        toast.success(
          `CONGRATULATIONS!!! ${
            board.getPlayer(board.winner).username
          }, WON!!!!`
        );
      }
      board.state = GAME_STATE.FINISHED;
    }
    board.updateHooks();
    console.log(`Nodes Visited: ${visited.size}`);
    console.log(`ALL Generated States: ${board.gameStates.size}`);
    return board;
  }

  static async alfaBeta(board: Board, depth: number = 5): Promise<Board> {
    if (board.state === GAME_STATE.CALCULATING) return board;
    let state = { ...board.getLastTree() };
    if (!state) return board;
    let alphaBetaState: AlfaBetaGameTree = {
      ...(state as GameTree),
      alphaBeta: [-Infinity, +Infinity],
      children: [],
    };
    board.setHeuristicPlayer();
    board.calculating();
    const initialChildren = board.genAllPossiblesStates();
    async function alfaBetaRecursivo(
      board: Board,
      state: AlfaBetaGameTree,
      parentAlfaBeta: number[],
      currentDepth: number,
      depth: number,
      visited: Set<string>
    ): Promise<number | null> {
      if (visited.has(`${state.value}-${state.player}`)) return 0;
      visited.add(`${state.value}-${state.player}`);
      board.loadState(state);

      if (currentDepth === depth) {
        return Board.getBoardHeuristicValue(board);
      }
      const type: "min" | "max" =
        board.currentPlayer === board.heuristicPlayer ? "max" : "min";
      state.children = board.genAllPossiblesStates().map((newState) => ({
        ...newState,
        alphaBeta: [...state.alphaBeta],
        children: [],
      }));

      if (state.children.length === 0) {
        // Apenas invertendo o estado pois jogador não possui jogadas válidas.
        const newPlayer =
          board.currentPlayer === board.p1.id ? board.p2.id : board.p1.id;
        const newState = {
          ...state,
          alphaBeta: [...state.alphaBeta],
          player: newPlayer,
        };
        board.getPlayer(state.player).moveCount++;
        const value = await alfaBetaRecursivo(
          board,
          newState,
          state.alphaBeta,
          currentDepth + 1,
          depth,
          visited
        );
        board.getPlayer(state.player).moveCount--;
        if (value !== null) {
          switch (type) {
            case "min":
              state.alphaBeta[1] =
                value < state.alphaBeta[1] ? value : state.alphaBeta[1];
              break;
            case "max":
              state.alphaBeta[0] =
                value > state.alphaBeta[0] ? value : state.alphaBeta[0];
              break;
          }
        }
        state.alphaBeta =
          state.alphaBeta[0] < state.alphaBeta[1]
            ? [state.alphaBeta[1], state.alphaBeta[1]]
            : [state.alphaBeta[0], state.alphaBeta[0]];
        return type == "max" ? state.alphaBeta[0] : state.alphaBeta[1];
      }

      for (const move of state.children) {
        await new Promise(requestAnimationFrame);
        board.getPlayer(state.player).moveCount++;
        const value = await alfaBetaRecursivo(
          board,
          move,
          state.alphaBeta,
          currentDepth + 1,
          depth,
          visited
        );
        board.getPlayer(state.player).moveCount--;
        if (value !== null) {
          switch (type) {
            case "min":
              state.alphaBeta[1] =
                value < state.alphaBeta[1] ? value : state.alphaBeta[1];
              break;
            case "max":
              state.alphaBeta[0] =
                value > state.alphaBeta[0] ? value : state.alphaBeta[0];
              break;
          }
          // Checar se com o novo valor de min e max precisa parar
          if (type === "min") {
            // Minimização // Parente é max
            // Se o valor do beta[1] (atual) for menor que o alfa[0](parente) -> para
            if (state.alphaBeta[1] <= parentAlfaBeta[0]) {
              console.log("CUTTING");
              break;
            }
          } else {
            // Maximização // Parente é min
            // Se o valor de alfa[0] (atual) for maior que o de beta[1](parente) -> para
            if (state.alphaBeta[0] >= parentAlfaBeta[1]) {
              console.log("CUTTING");
              break;
            }
          }
        }
      }

      state.alphaBeta =
        state.alphaBeta[0] < state.alphaBeta[1]
          ? [state.alphaBeta[1], state.alphaBeta[1]]
          : [state.alphaBeta[0], state.alphaBeta[0]];

      return type == "max" ? state.alphaBeta[0] : state.alphaBeta[1];
    }
    let visited = new Set<string>();
    const value = await alfaBetaRecursivo(
      board,
      alphaBetaState,
      [-Infinity, +Infinity],
      0,
      depth,
      visited
    );
    if (value !== null) {
      alphaBetaState.alphaBeta[0] = value;
      if (alphaBetaState.alphaBeta[1] > alphaBetaState.alphaBeta[0]) {
        alphaBetaState.alphaBeta[1] = alphaBetaState.alphaBeta[0];
      }
    }
    const newState =
      alphaBetaState.children && alphaBetaState.children?.length
        ? alphaBetaState.children?.reduce((prev, current) => {
            // Estamos maximizando, nó raiz, procurar melhor valor de alpha
            return (prev as AlfaBetaGameTree).alphaBeta[0] >=
              (current as AlfaBetaGameTree).alphaBeta[0]
              ? prev
              : current;
          })
        : null;
    const lastTree = board.getLastTree();
    if (newState && lastTree) {
      lastTree.children = initialChildren;
      lastTree.children?.forEach((s) => {
        if (s.value === newState.value) {
          s.active = true;
          board.getPlayer(board.currentPlayer).moveCount++;
          board.loadState(s);
          s.children = board.genAllPossiblesStates();
        }
      });
    } else board.loadState(state as GameTree);
    console.dir(board.gameTree, { depth: null });
    board.uncalculating();
    if (board.gameHasEnded()) {
      toast.info("THE GAME HAS FINISHED!!");
      if (board.winner === "") {
        toast.warning("The game ended with a DRAW :(");
        toast.info("Click on GAME FINISHED to restart the game!");
      } else {
        toast.success(
          `CONGRATULATIONS!!! ${
            board.getPlayer(board.winner).username
          }, WON!!!!`
        );
      }
      board.state = GAME_STATE.FINISHED;
    }
    board.updateHooks();
    console.log(`Nodes Visited: ${visited.size}`);
    console.log(`ALL Generated States: ${board.gameStates.size}`);
    return board;
  }

  setHeuristicPlayer() {
    this.heuristicPlayer = this.currentPlayer;
  }

  static getBoardHeuristicValue(board: Board): number {
    let qtdMovimentosMax: number = 0;
    let qtdNeighborsQueenMax: number = 0;
    let qtdMovimentosMin: number = 0;
    let qtdNeighborsQueenMin: number = 0;
    board.pieces.forEach((p) => {
      if (p.ownerId == board.heuristicPlayer) {
        const mov = p.getPossibleMoves(board).length;
        qtdMovimentosMax +=
          p.type === GAME_PIECE_TYPE.ANT && p.state === PIECE_STATE.BOARD
            ? 2 * mov
            : mov;
        if (p.state === PIECE_STATE.BOARD && p.type === GAME_PIECE_TYPE.QUEEN)
          qtdNeighborsQueenMax = board.getNeighbors({ ...p.pos })?.length || 1;
      } else {
        const mov = p.getPossibleMoves(board).length;
        qtdMovimentosMin +=
          p.type === GAME_PIECE_TYPE.ANT && p.state === PIECE_STATE.BOARD
            ? 2 * mov
            : mov;
        if (p.state === PIECE_STATE.BOARD && p.type === GAME_PIECE_TYPE.QUEEN)
          qtdNeighborsQueenMin = board.getNeighbors({ ...p.pos })?.length || 1;
      }
    });
    return (
      2 * qtdMovimentosMax -
      qtdMovimentosMin +
      30 * qtdNeighborsQueenMin -
      qtdNeighborsQueenMax
    );
  }

  private genAllPossiblesStates(): GameTree[] {
    let newChildren: GameTree[] = [];
    let clonePieces = new Map(this.pieces);
    this.pieces.forEach((piece) => {
      if (piece.ownerId === this.currentPlayer) {
        const possibleMoves = piece.getPossibleMoves(this);
        if (possibleMoves.length) {
          clonePieces.delete(hashPosToKey(piece.pos));
          let clonedPiece = new GamePiece(piece);
          possibleMoves.forEach((pm) => {
            clonedPiece.pos = pm;
            clonedPiece.state = PIECE_STATE.BOARD;
            clonePieces.set(hashPosToKey(pm), clonedPiece);
            const id = this.insertGameState(this.genGameState(clonePieces));
            newChildren.push({
              value: id,
              active: false,
              player:
                this.currentPlayer == this.p1.id ? this.p2.id : this.p1.id,
              p1: {
                firstMove: this.p1.firstMove
                  ? this.currentPlayer != this.p1.id
                  : this.p1.firstMove,
              },
              p2: {
                firstMove: this.p2.firstMove
                  ? this.currentPlayer != this.p2.id
                  : this.p2.firstMove,
              },
            });
            clonePieces.delete(hashPosToKey(pm));
          });
          clonePieces.set(hashPosToKey(piece.pos), piece);
        }
      }
    });
    const mapped = new Map(newChildren.map((p) => [p.value, p]));
    return Array.from(mapped.values());
  }

  saveGameState() {
    // Pego o último estado salvo na árvore,
    const lastTree = this.getLastTree();
    if (!lastTree) {
      // Não há nenhuma árvore criada, criar nó inicial!
      const id = this.insertGameState(this.genGameState());
      // Gerar todos os filhos e inserir na last tree;
      const children = this.genAllPossiblesStates();
      this.gameTree = {
        value: id,
        active: true,
        children,
        player: this.currentPlayer,
        p1: { firstMove: this.p1.firstMove },
        p2: { firstMove: this.p2.firstMove },
      };
    } else {
      //Já está inserido na last tree
      const id = this.insertGameState(this.genGameState());
      //Pego o id do estado (algum children já possui esse ID no value)
      lastTree.children?.forEach((c) => {
        if (c.value == id) {
          c.children = this.genAllPossiblesStates();
          c.active = true;
          c.p1.firstMove = this.p1.firstMove;
          c.p2.firstMove = this.p2.firstMove;
          return;
        }
      });
      if (lastTree.children && lastTree.children.length === 0) {
        //Player don't have any possible move
        let copy: GameTree = {
          ...lastTree,
        };
        copy.player = this.currentPlayer;
        copy.children = this.genAllPossiblesStates();
        lastTree.children.push(copy);
      }
    }
    this.pieces.forEach((p) => {
      p.possibleMoves = null;
    });
    console.dir(this.gameTree, {
      depth: null,
    });
  }

  private insertGameState(newState: GamePieceMinified[]): string {
    let id = v1();
    const generetedId = id;
    this.gameStates.forEach((value: GamePieceMinified[], key: string) => {
      if (this.isEqualState(newState, value)) {
        id = key;
        return;
      }
    });
    if (id === generetedId) {
      this.gameStates.set(generetedId, newState);
    }
    return id;
  }

  getLastTree(): GameTree | undefined {
    if (!this.gameTree) {
      return undefined;
    } else {
      let currentGame = this.gameTree;
      let found = true;
      while (currentGame.children && found) {
        found = false;
        currentGame.children.forEach((c) => {
          if (c.active) {
            currentGame = c;
            found = true;
            return;
          }
        });
      }
      return currentGame;
    }
  }

  private genGameState(pieces?: Map<string, GamePiece>): GamePieceMinified[] {
    return Object.values(Object.fromEntries(pieces ? pieces : this.pieces)).map(
      (p: GamePiece) => {
        const gamePiece: GamePieceMinified = {
          id: p.id,
          ownerId: p.ownerId,
          pos: p.pos,
          type: p.type,
          state: p.state,
        };
        return gamePiece;
      }
    );
  }

  private isEqualState(
    state: GamePieceMinified[],
    otherState: GamePieceMinified[]
  ): boolean {
    return state.every((piece) => {
      return otherState.some((otherPiece) => {
        return (
          piece.id === otherPiece.id &&
          this.isEqualPosition(piece.pos, otherPiece.pos) &&
          piece.state === otherPiece.state
        );
      });
    });
  }

  private isEqualPosition(
    pos: HexDirection,
    otherPos: HexDirection,
    withZ: boolean = true
  ): boolean {
    return (
      pos.q === otherPos.q &&
      pos.r === otherPos.r &&
      (withZ ? pos.z === otherPos.z : true)
    );
  }

  backState() {
    if (this.state !== GAME_STATE.PLAYING) {
      toast.info("To crtl+z you must be playing a match!");
      return;
    }
    const loadedPieces = this.loadLastState();
    if (loadedPieces) {
      let lastTree = this.getLastTree();
      if (lastTree) lastTree.active = false;
      if (this.gameTree && !this.gameTree.active) this.gameTree.active = true;
      this.currentPlayer = loadedPieces.player;
      if (this.getPlayer(this.currentPlayer).moveCount)
        this.getPlayer(this.currentPlayer).moveCount--;
      this.p1.firstMove = loadedPieces.p1.firstMove;
      this.p2.firstMove = loadedPieces.p2.firstMove;
      this.pieces = loadedPieces.pieces;
      let possibleMoves = this.genAllPossiblesStates();
      if (possibleMoves.length === 0) {
        this.backState();
      }
      this.updateHooks();
    } else {
      toast.warning("Can't return more state, alreay at the begning");
    }
    console.dir(this.gameTree, {
      depth: null,
    });
    this.updateHooks();
  }

  private gameTreeToPieces(gameTree: GameTree): Map<string, GamePiece> {
    const map = new Map<string, GamePiece>();
    const pieces = this.gameStates.get(gameTree.value);
    if (pieces) {
      pieces.forEach((p) => {
        map.set(hashPosToKey(p.pos), new GamePiece(p));
      });
    }

    return map;
  }

  private loadLastState():
    | (GameTree & { pieces: Map<string, GamePiece> })
    | undefined {
    if (this.gameTree) {
      let current = this.gameTree;
      let prev: GameTree | undefined = undefined;
      let found = true;
      while (current.children && found) {
        found = false;
        current.children.forEach((c) => {
          if (c.active) {
            found = true;
            prev = current;
            current = c;
            return;
          }
        });
      }
      if (prev !== undefined) {
        const pieces = this.gameTreeToPieces(prev);
        return {
          ...(prev as GameTree),
          pieces,
        };
      } else {
        const pieces = this.gameTreeToPieces(current);
        return {
          ...current,
          pieces,
        };
      }
    }
    return undefined;
  }

  addTimerRef(
    timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
  ) {
    this.timerRef = timerRef;
  }

  startTimer() {
    // Clear any existing timer
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }

    // Start new timer
    this.timerRef.current = setInterval(() => {
      if (this.state !== GAME_STATE.PLAYING) {
        return;
      }
      if (this.playerTimer <= 0) {
        this.changePlayer();
      } else {
        this.playerTimer--;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
      this.timerRef.current = null;
    }
  }

  initBoard() {
    this.pieces.clear();

    const piecesP1 = [
      {
        pos: {
          q: -5,
          r: -7,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.QUEEN,
      },
      {
        pos: {
          q: -3,
          r: -7,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.SPIDER,
      },
      {
        pos: {
          q: -2,
          r: -7,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.SPIDER,
      },
      {
        pos: {
          q: 0,
          r: -7,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.BEETLE,
      },
      {
        pos: {
          q: 1,
          r: -7,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.BEETLE,
      },
      {
        pos: {
          q: -6,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: -5,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: -4,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: -2,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
      {
        pos: {
          q: -1,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
      {
        pos: {
          q: 0,
          r: -5,
          z: 1,
        },
        ownerId: this.p1.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
    ];

    const piecesP2 = [
      {
        pos: {
          q: 5,
          r: -7,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.QUEEN,
      },
      {
        pos: {
          q: 7,
          r: -7,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.SPIDER,
      },
      {
        pos: {
          q: 8,
          r: -7,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.SPIDER,
      },
      {
        pos: {
          q: 10,
          r: -7,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.BEETLE,
      },
      {
        pos: {
          q: 11,
          r: -7,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.BEETLE,
      },
      {
        pos: {
          q: 4,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: 5,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: 6,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.ANT,
      },
      {
        pos: {
          q: 8,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
      {
        pos: {
          q: 9,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
      {
        pos: {
          q: 10,
          r: -5,
          z: 1,
        },
        ownerId: this.p2.id,
        type: GAME_PIECE_TYPE.GRASSHOPPER,
      },
    ];

    this.placePieces([...piecesP1, ...piecesP2]);
    this.currentPlayer = this.p1.id;
    this.p1.firstMove = true;
    this.p2.firstMove = true;
    this.gameStates = new Map();
    this.gameTree = undefined;
    this.saveGameState();
  }

  start() {
    this.initBoard();
    this.playerTimer = this.getPlayer(this.currentPlayer).time;
    this.state = GAME_STATE.PLAYING;
    this.winner = "";
    this.startTimer();
    this.updateHooks();
  }

  pause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.updateHooks();
    }
  }

  unpause() {
    if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.updateHooks();
    }
  }

  calculating() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.CALCULATING;
      this.updateHooks();
    }
  }

  uncalculating() {
    if (this.state === GAME_STATE.CALCULATING) {
      this.state = GAME_STATE.PLAYING;
      this.updateHooks();
    }
  }

  restart() {
    this.p1.time = gameTimerStats[this.timerConfig].timer;
    this.p2.time = gameTimerStats[this.timerConfig].timer;
    this.offSet = {
      x: 0,
      y: 0,
    };
    this.start();
    this.updateHooks();
  }

  updateHooks() {
    this.hooks.forEach((hook) => {
      hook({
        currentPlayer: this.getPlayer(this.currentPlayer),
        difficulty: this.difficulty,
        state: this.state,
        playerTimer: this.playerTimer,
      } as GameHookState);
    });
  }

  getPlayer(id: string): GamePlayer {
    if (id === this.p1.id) return this.p1;
    return this.p2;
  }

  insertPiece(pieceToInsert: GamePiece) {
    if (this.pieces.has(pieceToInsert.id)) {
      if (pieceToInsert.type === GAME_PIECE_TYPE.BEETLE) {
        pieceToInsert.pos.z++;
        pieceToInsert.id = GamePiece.hashPosToKey(pieceToInsert.pos);
        if (this.pieces.has(pieceToInsert.id))
          throw new Error(
            `Não foi possível inserir a peça ${pieceToInsert.type}!`
          );
      } else {
        throw new Error(
          `Não foi possível inserir a peça ${pieceToInsert.type}!`
        );
      }
    }
  }

  brokeBoard(piece: GamePiece): boolean {
    const piecesClone = new Map(this.pieces);
    piecesClone.delete(GamePiece.hashPosToKey(piece.pos));
    const pieces = Array.from(piecesClone.entries()).filter(
      ([_key, p]) =>
        p.state === PIECE_STATE.BOARD &&
        !piecesClone.has(GamePiece.hashPosToKey({ ...p.pos, z: p.pos.z + 1 }))
    );
    const piecesFound = [...pieces.map((p) => p[1].pos)];
    if (piecesFound.length === 0) return false;
    const freq = new Map();
    const queue = [];
    queue.push(piecesFound[0]);
    while (queue.length > 0) {
      const current = queue.shift();
      if (current) {
        freq.set(GamePiece.hashPosToKey(current), true);
        const neighbors = this.getNeighbors(current);
        if (neighbors) {
          queue.push(
            ...neighbors
              ?.filter(
                (p) =>
                  p?.pos &&
                  !freq.get(GamePiece.hashPosToKey(p.pos)) &&
                  !this.isEqualPosition(p.pos, piece.pos)
              )
              .map((p) => p?.pos)
          );
        }
      }
    }
    return freq.size !== piecesFound.length;
  }

  canSlide(
    from: HexDirection,
    to: HexDirection,
    type: GAME_PIECE_TYPE,
    self?: string
  ): boolean {
    if (type === GAME_PIECE_TYPE.GRASSHOPPER) {
      return true;
    } else {
      return Object.entries(hexDirectionsCardinal).some(([key, dir]) => {
        if (to.q !== from.q + dir.q || to.r !== from.r + dir.r) return false;
        const path: HexDirection[] = [];
        switch (key) {
          case "LESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["NORDESTE"].q,
              r: from.r + hexDirectionsCardinal["NORDESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["SUDESTE"].q,
              r: from.r + hexDirectionsCardinal["SUDESTE"].r,
              z: 1,
            });
            break;
          case "NORDESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["NOROESTE"].q,
              r: from.r + hexDirectionsCardinal["NOROESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["LESTE"].q,
              r: from.r + hexDirectionsCardinal["LESTE"].r,
              z: 1,
            });
            break;
          case "NOROESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["OESTE"].q,
              r: from.r + hexDirectionsCardinal["OESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["NORDESTE"].q,
              r: from.r + hexDirectionsCardinal["NORDESTE"].r,
              z: 1,
            });
            break;
          case "OESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["NOROESTE"].q,
              r: from.r + hexDirectionsCardinal["NOROESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["SUDOESTE"].q,
              r: from.r + hexDirectionsCardinal["SUDOESTE"].r,
              z: 1,
            });
            break;
          case "SUDOESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["OESTE"].q,
              r: from.r + hexDirectionsCardinal["OESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["SUDESTE"].q,
              r: from.r + hexDirectionsCardinal["SUDESTE"].r,
              z: 1,
            });
            break;
          case "SUDESTE":
            path.push({
              q: from.q + hexDirectionsCardinal["SUDOESTE"].q,
              r: from.r + hexDirectionsCardinal["SUDOESTE"].r,
              z: 1,
            });
            path.push({
              q: from.q + hexDirectionsCardinal["LESTE"].q,
              r: from.r + hexDirectionsCardinal["LESTE"].r,
              z: 1,
            });
            break;
          default:
            return false;
        }
        if (self) {
          const keys: (GamePiece | undefined)[] = [
            this.pieces.get(hashPosToKey(path[0])),
            this.pieces.get(hashPosToKey(path[1])),
          ];
          return (
            keys.some((p) => p?.id === self) ||
            this.pieces.has(hashPosToKey(path[0])) !==
              this.pieces.has(hashPosToKey(path[1]))
          );
        } else {
          return (
            this.pieces.has(hashPosToKey(path[0])) !==
            this.pieces.has(hashPosToKey(path[1]))
          ); // XOR comparission
        }
      });
    }
  }

  dropPiece(piece: GamePiece, to: HexDirection): GamePiece {
    const validMoves = piece.getPossibleMoves(this);
    const moveHex = validMoves.find((move) =>
      this.isEqualPosition(move, to, false)
    );
    if (moveHex) {
      this.pieces.delete(GamePiece.hashPosToKey(piece.pos));
      //VALID MOVE
      piece.draggable.offSet = { x: 0, y: 0 };
      piece.pos = moveHex;
      piece.state = PIECE_STATE.BOARD;
      this.pieces.set(GamePiece.hashPosToKey(piece.pos), piece);
      let player = this.getPlayer(this.currentPlayer);
      player.firstMove = false;
      player.moveCount++;
      this.pieces.forEach((p) => (p.possibleMoves = null));
      this.changePlayer();
      return piece;
    } else {
      this.pieces.forEach((p) => (p.possibleMoves = null));
      toast.error("Unabble to move");
      return piece;
    }
  }

  calcPlayerCanMove(): boolean {
    if (this.getPlayer(this.currentPlayer).firstMove) return true;

    const pieces = Array.from(this.pieces.values()).filter(
      (p) => p.ownerId === this.currentPlayer
    );

    if (
      pieces.some(
        (p) =>
          p.type === GAME_PIECE_TYPE.BEETLE &&
          p.state === PIECE_STATE.BOARD &&
          !this.pieces.has(hashPosToKey({ ...p.pos, z: p.pos.z + 1 })) &&
          !this.brokeBoard(p)
      )
    )
      return true; // Besouro pode se mover e não tem ninguem em cima

    if (
      pieces.some(
        (p) =>
          p.state === PIECE_STATE.BOARD &&
          !this.pieces.has(hashPosToKey({ ...p.pos, z: p.pos.z + 1 })) && // Não tem ninguem em cima
          hexDirections.some((dir) => {
            const newPos: HexDirection = {
              q: dir.q + p.pos.q,
              r: dir.r + p.pos.r,
              z: 1,
            };
            return (
              !this.pieces.has(hashPosToKey(newPos)) && // Nem tem peça naquela direção
              !this.getNeighbors(newPos)?.some((filtered) => {
                return filtered?.ownerId !== this.currentPlayer;
              }) // Os vizinhos não são inimigos
            );
          })
      )
    )
      return true;

    if (
      pieces.some(
        (p) =>
          p.state === PIECE_STATE.BOARD &&
          !this.pieces.has(hashPosToKey({ ...p.pos, z: p.pos.z + 1 })) &&
          !this.brokeBoard(p) &&
          p.canMove(this)
      )
    )
      return true; // se tem aalgum movimento válido das peças do board

    return false;
  }

  gameHasEnded(): boolean {
    if (this.playerTimer <= 0) {
      this.state = GAME_STATE.FINISHED;
      this.winner =
        this.currentPlayer === this.p1.id ? this.p2.username : this.p1.username;
      return true;
    }

    const queens: GamePiece[] = Array.from(this.pieces.values()).filter((p) => {
      return p.state === PIECE_STATE.BOARD && p.type === GAME_PIECE_TYPE.QUEEN;
    });
    const qtdQueenBlocked: GamePiece[] = queens.filter((p) => {
      const neighbors = this.getNeighbors(p.pos);
      return neighbors && neighbors.length >= 6;
    });
    if (qtdQueenBlocked.length == 1) {
      this.state = GAME_STATE.FINISHED;
      this.winner =
        qtdQueenBlocked[0].ownerId === this.p1.id ? this.p2.id : this.p1.id;
      return true;
    } else if (qtdQueenBlocked.length == 2) {
      this.state = GAME_STATE.FINISHED;
      this.winner = "";
      return true;
    } else return false;
  }

  changePlayer() {
    if (this.gameHasEnded()) {
      toast.info("THE GAME HAS FINISHED!!");
      if (this.winner === "") {
        toast.warning("The game ended with a DRAW :(");
        toast.info("Click on GAME FINISHED to restart the game!");
      } else {
        toast.success(
          `CONGRATULATIONS!!! ${this.getPlayer(this.winner).username}, WON!!!!`
        );
      }
    } else {
      if (this.currentPlayer === this.p1.id) {
        this.p1.moveCount = this.p1.moveCount ? this.p1.moveCount + 1 : 1;
        this.p1.time =
          this.playerTimer < 5 ? this.playerTimer + 5 : this.playerTimer;
        this.currentPlayer = this.p2.id;
        this.playerTimer = this.p2.time;
      } else {
        this.p2.moveCount = this.p2.moveCount ? this.p2.moveCount + 1 : 1;
        this.p2.time =
          this.playerTimer < 5 ? this.playerTimer + 5 : this.playerTimer;
        this.currentPlayer = this.p1.id;
        this.playerTimer = this.p1.time;
      }
      this.getPlayer(this.currentPlayer).canMove = this.calcPlayerCanMove();
      if (!this.p1.canMove && !this.p2.canMove) {
        toast.warning("The game ended with a DRAW :(");
        toast.info("Click on GAME FINISHED to restart the game!");
        this.state = GAME_STATE.FINISHED;
      } else if (!this.getPlayer(this.currentPlayer).canMove) {
        toast.info(
          `The player ${
            this.getPlayer(this.currentPlayer).username
          } lost his turn, doesn't have valid move!`
        );
        this.saveGameState(); // must save state, player lost the move
        this.changePlayer();
      }
    }
    this.saveGameState();
    this.updateHooks();
  }

  canvaClick(x: number, y: number) {
    if (this.state !== GAME_STATE.PLAYING) {
      toast.info("You must be playing to intereact with the board");
      return;
    }

    const pos: HexDirection = this.pixelToCube(x, y);
    const hashPos = [5, 4, 3, 2, 1]
      .map((z) => GamePiece.hashPosToKey({ q: pos.q, r: pos.r, z }))
      .filter((p) => this.pieces.has(p)); // Para cada z, verifica se a peça está no Hive MAX 1 peça e 2 besouros
    if (hashPos.length > 0) {
      const piece = this.pieces.get(hashPos[0]);
      if (
        piece &&
        piece.canDrag(this.currentPlayer) &&
        !this.pieces.has(
          GamePiece.hashPosToKey({ ...piece.pos, z: piece.pos.z + 1 })
        )
      ) {
        piece.draggable.isDragging = true;
        piece.draggable.offSet = { x, y };
      }
      return;
    } else {
      this.moveBoard2(50);
    }
  }

  canvaDrop(x: number, y: number) {
    if (this.state !== GAME_STATE.PLAYING) return;
    this.pieces.forEach((p) => {
      if (p.draggable.isDragging) {
        p.draggable.isDragging = false;
        p.possibleMoves = null;
        p = this.dropPiece(p, this.pixelToCube(x, y));
      }
    });
  }

  canvaMove(x: number, y: number) {
    if (this.state !== GAME_STATE.PLAYING) return;
    this.mousePos = { ...this.mousePos, x, y };
    this.pieces.forEach((p) => {
      if (p.draggable.isDragging) {
        p.draggable.offSet.x = x;
        p.draggable.offSet.y = y;
        if (p.state === PIECE_STATE.BOARD) this.moveBoard2(10);
      }
    });
    if (!this.isOnBoard(x, y)) {
      this.mousePos = { state: PIECE_STATE.PLAYER, x, y };
    } else {
      this.mousePos = { state: PIECE_STATE.BOARD, x, y };
    }
  }

  isOnBoard(_x: number, y: number) {
    if (!this.currentCanva) return false;

    return y >= this.divisoryBoard && y <= this.currentCanva.height;
  }

  isOnBoardBorder(
    xPos: number,
    yPos: number,
    border: number = 45,
    truePos: boolean = true
  ) {
    if (!this.currentCanva) return false;

    const x = truePos ? xPos : xPos + this.offSet.x;
    const y = truePos ? yPos : yPos + this.offSet.y;

    return !(
      x <= border ||
      x >= this.currentCanva.width - border ||
      y >= this.divisoryBoard - border ||
      y >= this.currentCanva.height - border
    );
  }

  drawHexHover(xPos: number, yPos: number, customColor?: string) {
    const stroke = customColor || "#ebe3e3";
    if (!this.currentCanva) {
      return;
    }
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) {
      return;
    }

    if (PIECE_STATE.PLAYER === this.mousePos.state) {
      return;
    }

    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    const { x, y } = this.cubeToPixel(this.pixelToCube(xPos, yPos));

    const hoverSize = this.HEX_SIZE * 1.1;

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = x + hoverSize * Math.cos(angle);
      const py = y + hoverSize * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = customColor || "rgba(0, 0, 0, 0.4)";
    ctx.fill();

    ctx.restore();
  }

  addContext(ctx: HTMLCanvasElement | null) {
    if (ctx) this.currentCanva = ctx;
    return this;
  }

  isHoveringPiece(mousePos: pos, piecePos: pos) {
    if (this.mousePos.state === PIECE_STATE.BOARD) {
      mousePos.x += this.offSet.x;
      mousePos.y += this.offSet.y;
    }
    return (
      this.mousePos.x > piecePos.x - this.HEX_SIZE / 2 &&
      this.mousePos.x < piecePos.x + this.HEX_SIZE / 2 &&
      this.mousePos.y > piecePos.y - this.HEX_SIZE / 2 &&
      this.mousePos.y < piecePos.y + this.HEX_SIZE / 2
    );
  }

  renderPieces(pieces: GamePiece[]) {
    if (!this.currentCanva) return;
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) return;
    for (let piece of pieces) {
      const { x, y } =
        piece.draggable.isDragging || piece.draggable.isMoving
          ? {
              x: piece.draggable.offSet.x,
              y: piece.draggable.offSet.y,
            }
          : this.cubeToPixel(piece.pos, piece.state);
      if (
        !piece.draggable.isDragging &&
        this.isHoveringPiece({ ...this.mousePos }, { x, y })
      ) {
        this.drawHex(x, y, piece, true);
      } else {
        this.drawHex(x, y, piece);
      }
    }
    // const {x, y} = this.cubeToPixel(hexDirectionsCardinal["NORDESTE"]);
    // const {x: x2, y: y2} = this.cubeToPixel({q:0, r:0, z:1});
    // this.drawHexHover(x, y, "#222");
    // this.drawHexHover(x2, y2);
  }

  renderBoardPieces() {
    this.pieces.forEach((p) => {
      if (p.draggable.isDragging) {
        p.getPossibleMoves(this).forEach((pos) => {
          const { x, y } = this.cubeToPixel(pos, PIECE_STATE.BOARD);
          this.drawHexHover(x, y, "rgba(99, 215, 107, 0.76)");
        });
      }
    });
    this.renderPieces(
      Array.from(this.pieces.values()).filter(
        (p) => p.state === PIECE_STATE.BOARD
      )
    );
  }

  renderPlayerPieces() {
    this.renderPieces(
      Array.from(this.pieces.values()).filter(
        (p) => p.state === PIECE_STATE.PLAYER
      )
    );
  }

  cubeToPixel({ q, r }: HexDirection, pieceState?: PIECE_STATE) {
    if (!this.currentCanva) return { x: 0, y: 0 };
    const canvaWidth =
      pieceState === undefined
        ? this.mousePos.state === PIECE_STATE.BOARD
          ? this.currentCanva.width + this.offSet.x
          : this.currentCanva.width
        : pieceState === PIECE_STATE.BOARD
        ? this.currentCanva.width + this.offSet.x
        : this.currentCanva.width;
    const canvaHeight =
      pieceState === undefined
        ? this.mousePos.state === PIECE_STATE.BOARD
          ? this.currentCanva.height + this.offSet.y
          : this.currentCanva.height
        : pieceState === PIECE_STATE.BOARD
        ? this.currentCanva.height + this.offSet.y
        : this.currentCanva.height;
    const x = this.HEX_WIDTH * (q + r / 2) + canvaWidth / 2;
    const y = this.HEX_HEIGHT * (3 / 4) * r + canvaHeight / 2;
    return { x, y };
  }

  pixelToCube(x: number, y: number, pieceState?: PIECE_STATE): HexDirection {
    if (!this.currentCanva) return { q: 0, r: 0, z: 0 };
    const canvaWidth =
      pieceState === undefined
        ? this.mousePos.state === PIECE_STATE.BOARD
          ? this.currentCanva.width + this.offSet.x
          : this.currentCanva.width
        : pieceState === PIECE_STATE.BOARD
        ? this.currentCanva.width + this.offSet.x
        : this.currentCanva.width;
    const canvaHeight =
      pieceState === undefined
        ? this.mousePos.state === PIECE_STATE.BOARD
          ? this.currentCanva.height + this.offSet.y
          : this.currentCanva.height
        : pieceState === PIECE_STATE.BOARD
        ? this.currentCanva.height + this.offSet.y
        : this.currentCanva.height;
    const xOffset = x - canvaWidth / 2;
    const yOffset = y - canvaHeight / 2;
    const q = ((xOffset * Math.sqrt(3)) / 3 - yOffset / 3) / this.HEX_SIZE;
    const r = (yOffset * 2) / 3 / this.HEX_SIZE;
    return this.cubeRound({ q, r, z: 1 } as HexDirection);
  }

  cubeRound({ q, r }: HexDirection): HexDirection {
    if (!this.currentCanva) return { q: 0, r: 0, z: 0 };
    let x = q;
    let z = r;
    let y = -x - z;

    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);

    const x_diff = Math.abs(rx - x);
    const y_diff = Math.abs(ry - y);
    const z_diff = Math.abs(rz - z);

    if (x_diff > y_diff && x_diff > z_diff) {
      rx = -ry - rz;
    } else if (y_diff > z_diff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return { q: rx, r: rz, z: 1 };
  }

  drawHex(x: number, y: number, piece: GamePiece, makedBorder?: boolean) {
    const fillColor = piece.ownerId == this.p1.id ? "white" : "black";
    const stroke =
      this.state === GAME_STATE.FINISHED || this.state === GAME_STATE.PAUSED
        ? "rgb(255, 0, 0)"
        : makedBorder
        ? piece.ownerId == this.currentPlayer
          ? "rgb(10, 233, 97)"
          : "rgb(255, 0, 0)"
        : "transparent";
    if (!this.currentCanva) return;
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = x + this.HEX_SIZE * Math.cos(angle);
      const py = y + this.HEX_SIZE * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();

    const img = Board.pieceImages[piece.type];
    if (img) {
      ctx.drawImage(
        img,
        x - ((img.width - this.HEX_SIZE) / img.width) * (this.HEX_SIZE / 2),
        y - this.HEX_SIZE / 2,
        ((img.width - this.HEX_SIZE) / img.width) * this.HEX_SIZE,
        this.HEX_SIZE
      );
    }
  }

  getNeighbors({ q, r }: HexDirection) {
    if (!this.currentCanva) return;
    let neighbors: GamePiece[] = [];
    hexDirections.forEach((dir) => {
      const pos = { q: q + dir.q, r: r + dir.r, z: 1 };
      while (this.pieces.has(GamePiece.hashPosToKey(pos))) {
        pos.z++;
      }
      if (pos.z > 1) {
        pos.z--;
        const n = this.pieces.get(GamePiece.hashPosToKey(pos));
        if (n) neighbors.push(n);
      }
    });
    return neighbors;
  }

  placePiece(pieceContructor: GamePieceConstructor) {
    if (this.pieces.has(GamePiece.hashPosToKey(pieceContructor.pos)))
      return false;
    const piece = new GamePiece(pieceContructor);
    this.pieces.set(GamePiece.hashPosToKey(piece.pos), piece);
  }

  placePieces(pieces: GamePieceConstructor[]) {
    pieces.forEach((p) => this.placePiece(p));
  }

  renderBoard() {
    if (!this.currentCanva) return;
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) return;

    //draw line on middle of the width but with height of 5*30
    ctx.beginPath();
    ctx.moveTo(this.currentCanva.width / 2, 0);
    ctx.lineTo(this.currentCanva.width / 2, this.divisoryBoard);
    ctx.moveTo(0, this.divisoryBoard);
    ctx.lineTo(this.currentCanva.width, this.divisoryBoard);
    ctx.closePath();
    ctx.strokeStyle = "#000";
    ctx.stroke();
  }

  moveBoard2(velocity: number = 2) {
    if (!this.currentCanva) return;
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) return;

    // get the border of the piece (north, south, east, west)
    const border = 40;
    if (this.mousePos.x < border) {
      // Encostou na esquerda
      this.offSet.x += velocity;
    }
    if (this.mousePos.x > this.currentCanva.width - border) {
      // Encostou na direita
      this.offSet.x -= velocity;
    }
    if (this.mousePos.y > this.currentCanva.height - border) {
      // Encostou em baixo
      this.offSet.y -= velocity;
    }
    if (
      this.mousePos.y > this.divisoryBoard - border &&
      this.mousePos.y < this.divisoryBoard + border
    ) {
      // Encostou em cima
      this.offSet.y += velocity;
    }
  }

  render() {
    if (!this.currentCanva) return;
    const ctx = this.currentCanva.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, this.currentCanva.width, this.currentCanva.height);
    this.renderBoard();
    this.renderPlayerPieces();
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      0,
      this.divisoryBoard,
      this.currentCanva.width,
      this.currentCanva.height
    );
    ctx.clip();
    this.renderBoardPieces();
    this.drawHexHover(
      this.mousePos.x,
      this.mousePos.y,
      "rgba(235, 203, 61, 0.76)"
    );
    ctx.restore();
  }
}
