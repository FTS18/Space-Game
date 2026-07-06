export interface Game {
  id: number;
  title: string;
  badge: string;
  description: string;
  image: string;
  link: string;
  platforms: string;
  isComingSoon: boolean;
  src: string;
  isSquare?: boolean;
  icon: string;
}

export const allGames: Game[] = [
  {
    id: 0,
    title: "Space Fire",
    badge: "SPACE SHOOTER",
    description: "Defend the cosmos from incoming threats. Fast-paced classic space shooter action.",
    image: "/assets/images/backgrounds/24.png",
    link: "/games/space-fire",
    src: "/games/space-fire/index.html",
    platforms: "PC / ANDROID",
    isComingSoon: false,
    icon: "fas fa-circle-notch"
  },
  {
    id: 1,
    title: "PacMan",
    badge: "RETRO MAZE",
    description: "Dodge ghosts, clear all pellets, and set your highscore on the classic neon map.",
    image: "/assets/images/backgrounds/01.jpg",
    link: "/games/pacman",
    src: "/games/pacman/index.html",
    platforms: "WEB / PC / ANDROID",
    isComingSoon: false,
    isSquare: true,
    icon: "fas fa-ghost"
  },
  {
    id: 6,
    title: "Ludo",
    badge: "BOARD GAME",
    description: "Classic neon board strategy. Roll the dice to lead your tokens home. VS AI, local, or online.",
    image: "/assets/images/backgrounds/09.jpg",
    link: "/games/ludo",
    src: "/games/ludo/index.html",
    platforms: "WEB / PC / MOBILE",
    isComingSoon: false,
    isSquare: true,
    icon: "fas fa-dice"
  },
  {
    id: 2,
    title: "Ping Pong",
    badge: "SPORTS CLASSIC",
    description: "Fast-paced physics-based table tennis action. Face off against the system AI.",
    image: "/assets/images/backgrounds/14.jpg",
    link: "/games/ping-pong",
    src: "/games/ping-pong/index.html",
    platforms: "WEB / PC / ANDROID",
    isComingSoon: false,
    icon: "fas fa-table-tennis-paddle-ball"
  },
  {
    id: 3,
    title: "Tic Tac Toe",
    badge: "PUZZLE GRID",
    description: "Strategic neon grid logic. Outsmart the unbeatable computer AI or play online multiplayer.",
    image: "/assets/images/backgrounds/09.jpg",
    link: "/games/tic-tac-toe",
    src: "/games/tic-tac-toe/index.html",
    platforms: "WEB / MOBILE",
    isComingSoon: false,
    isSquare: true,
    icon: "fas fa-times"
  },
  {
    id: 4,
    title: "Scribble",
    badge: "MULTIPLAYER DRAW",
    description: "Real-time multiplayer drawing and guessing game. Create a lobby and sketch with friends.",
    image: "/assets/images/backgrounds/05.jpg",
    link: "/games/scribble",
    src: "/games/scribble/index.html",
    platforms: "WEB / MOBILE",
    isComingSoon: false,
    icon: "fas fa-palette"
  },
  {
    id: 5,
    title: "2048",
    badge: "PUZZLE GRID",
    description: "Slide grid tiles to merge matching numbers and reach the ultimate 2048 tile!",
    image: "/assets/images/backgrounds/22.webp",
    link: "/games/2048",
    src: "/games/2048/index.html",
    platforms: "WEB / PC / MOBILE",
    isComingSoon: false,
    isSquare: true,
    icon: "fas fa-th-large"
  }
];

export const gamesMap = allGames.reduce((acc, game) => {
  const slug = game.link.split('/').pop()!;
  acc[slug] = {
    title: game.title,
    src: game.src,
    bg: game.image,
    isSquare: game.isSquare
  };
  return acc;
}, {} as Record<string, { title: string; src: string; bg: string; isSquare?: boolean }>);
