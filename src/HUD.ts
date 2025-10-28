export class HUD {
  private healthElement: HTMLElement;

  constructor() {
    this.healthElement = document.getElementById('health');
  }

  public updateHealth(health: number) {
    this.healthElement.innerText = `Health: ${health}`;
  }
}
