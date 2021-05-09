import SnakeGame from "./SnakeGame";

window.onload = () => {
  const snakeGame = new SnakeGame();
  document.body.appendChild(snakeGame.container);
};