import type { SceneDocument } from "../domain/scene";
/** Bounded immutable authored snapshots only; no preview state or engine handles. */
export class SceneHistory {
  private past: SceneDocument[] = [];
  private future: SceneDocument[] = [];
  private gesture: SceneDocument | null = null;
  get canUndo() {
    return this.past.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
  private push(scene: SceneDocument) {
    this.past.push(scene);
    if (this.past.length > 50) this.past.shift();
  }
  record(before: SceneDocument, after: SceneDocument) {
    if (JSON.stringify(before) === JSON.stringify(after)) return false;
    if (!this.gesture) {
      this.push(before);
      this.future = [];
    }
    return true;
  }
  begin(scene: SceneDocument) {
    this.gesture = scene;
  }
  end(scene: SceneDocument) {
    const start = this.gesture;
    this.gesture = null;
    if (start && JSON.stringify(start) !== JSON.stringify(scene)) {
      this.push(start);
      this.future = [];
    }
  }
  undo(current: SceneDocument) {
    this.end(current);
    const previous = this.past.pop();
    if (!previous) return null;
    this.future.push(current);
    return previous;
  }
  redo(current: SceneDocument) {
    const next = this.future.pop();
    if (!next) return null;
    this.push(current);
    return next;
  }
}
