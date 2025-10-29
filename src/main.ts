import './style.css';
import { WadParser } from './wad-parser';
import { Game } from './game';

const wadParser = new WadParser();

const uploadWadButton = document.getElementById('upload-wad') as HTMLButtonElement;
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.wad';

uploadWadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    try {
      const wad = await wadParser.parse(file);
      console.log('WAD parsed successfully:', wad);
      console.log(wad);

      const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      const game = new Game(canvas, wad);
      game.start();

      // Hide the landing screen
      const landingScreen = document.getElementById('landing-screen') as HTMLDivElement;
      landingScreen.style.display = 'none';

    } catch (error) {
      console.error('Error parsing WAD file:', error);
    }
  }
});
