import "current-device";
import SnakeGame from "./SnakeGame";

window.onload = () => {
  new SnakeGame();

  const isDesktop = (window as any).device.desktop();

  if (!isDesktop) {
    document.body.addEventListener('contextmenu', function(event: Event) {
      event.preventDefault();
      return false;
    });

    document.querySelectorAll('.ok-key-name').forEach((el) => {
      (el as HTMLElement).innerText = 'OK键';
    });
    (document.querySelector('#btn-help') as HTMLElement).innerText = '?';
  }

  const btnHelp = document.getElementById('btn-help');
  btnHelp.onclick = () => {
    const helpEl = document.querySelector(`.help.${isDesktop ? 'desktop' : 'mobile'}`) as HTMLElement;
    helpEl.style.display = helpEl.style.display == 'none' ? 'block' : 'none';
  };
};