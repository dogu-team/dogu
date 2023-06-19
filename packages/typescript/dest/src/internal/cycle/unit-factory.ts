import { AfterUnit } from './unit/after-unit';
import { Unit } from './unit/unit';

export class UnitFactory {
  private _before: Unit | null = null;
  private _after: AfterUnit | null = null;

  set before(unit: Unit | null) {
    if (this._before) {
      throw new Error('Before is already set');
    }
    this._before = unit;
  }

  get before(): Unit | null {
    return this._before;
  }

  set after(unit: AfterUnit | null) {
    if (!this._before) {
      throw new Error('Before must be set before after');
    }
    if (this._after) {
      throw new Error('After is already set');
    }
    this._after = unit;
  }

  get after(): AfterUnit | null {
    return this._after;
  }

  clone(): { before: Unit | null; after: Unit | null } {
    if (!this._before) {
      return { before: null, after: null };
    } else {
      if (!this._after) {
        return { before: this._before.clone(), after: null };
      } else {
        const before = this._before.clone();
        const after = this._after.clone();
        after.before = before;
        return { before, after };
      }
    }
  }
}
