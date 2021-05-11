import "current-device";
import SnakeGame from "./SnakeGame";

window.onload = () => {
  const snakeGame = new SnakeGame();

  if (!(window as any).device.desktop()) {
    document.querySelectorAll('.ok-key-name').forEach((el) => {
      (el as HTMLElement).innerText = 'OK键';
    });
  }
};