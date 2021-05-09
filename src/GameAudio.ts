export default class GameAudio {
  private static samples: Map<String, any> = new Map(); 

  public static play(name: string) {
    const audio = this.samples.get(name);
    audio.currentTime = 0;
    audio.play();
  }

  public static add(name: string, src: string) {
    const audio = new Audio();
    audio.src = src;
    this.samples.set(name, audio);
  }
}

GameAudio.add('eat', 'audio/eat.ogg');
