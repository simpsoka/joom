import { GameState } from './GameState';
import { Game } from './Game';

export class UIManager {
  private mainMenu: HTMLElement;
  private pauseMenu: HTMLElement;
  private gameOverScreen: HTMLElement;
  private hud: HTMLElement;

  constructor(private game: Game) {
    this.mainMenu = document.getElementById('main-menu');
    this.pauseMenu = document.getElementById('pause-menu');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.hud = document.getElementById('hud');

    document.getElementById('start-button').addEventListener('click', () => {
      this.game.setGameState(GameState.PLAYING);
    });
    document.getElementById('resume-button').addEventListener('click', () => {
      this.game.setGameState(GameState.PLAYING);
    });
    document.getElementById('restart-button').addEventListener('click', () => {
      window.location.reload();
    });
  }

  public update(gameState: GameState) {
    this.mainMenu.style.display = gameState === GameState.MAIN_MENU ? 'flex' : 'none';
    this.pauseMenu.style.display = gameState === GameState.PAUSED ? 'flex' : 'none';
    this.gameOverScreen.style.display = gameState === GameState.GAME_OVER ? 'flex' : 'none';
    this.hud.style.display = gameState === GameState.PLAYING ? 'block' : 'none';
  }
}
