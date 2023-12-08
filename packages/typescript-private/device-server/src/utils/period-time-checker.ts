export class PeriodTimeChecker {
  public set period(value: number) {
    this._period = value;
  }
  public get isTimeHasCome(): boolean {
    return this._isTimeHasCome;
  }
  private befTime: number = Date.now();
  private _isTimeHasCome = false;

  constructor(private _period: number) {}

  public updateTime(): void {
    if (0 === this._period) {
      this._isTimeHasCome = false;
      return;
    }
    if (Date.now() - this.befTime < this._period) {
      this._isTimeHasCome = false;
      return;
    }
    this.befTime = Date.now();
    this._isTimeHasCome = true;
  }
}
