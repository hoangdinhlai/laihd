// Colleagues: people at the desks your sessions are not using, so the floor looks like a working office even when
// only one or two sessions are open.
//
// They are decoration and nothing else. A session is a real Claude Code session and always comes first: a colleague
// only ever sits at a desk no session holds, and gets up and moves along the moment a session takes the desk under
// them. They never appear in the session list, never hold a desk against a session, and say nothing in the group
// chat — look at the list on the left to see who is really working.
//
// How many there are is set in src/colleagues.js.
import { COLLEAGUES, COLLEAGUE_NAMES } from '../../colleagues.js';
import { PRO, officeNow, rand } from '../core/env.js';
import { DESKS } from '../world/desks.js';
import { DESK_SPOTS } from './navigation.js';
import { Worker, npcs, sessions } from './workers.js';
import { isWorkday } from '../../shared/workdays.js';

const SHIRTS = ['#6A8042', '#3F7CC4', '#C9A227', '#2A9D8F', '#B5651D', '#8C4FA8', '#D64550', '#5B6CD8'];
const HAIR = ['#2B2420', '#1C1A18', '#4A3524', '#3A2E26'];
let people = [];

/** Desks a session holds right now; a colleague never sits at one of these. */
function takenDesks() {
  const used = new Set();
  for (const s of sessions.values()) if (s.desk >= 0) used.add(s.desk);
  return used;
}

export function setup() {
  people = [];
  const n = PRO ? COLLEAGUES.pro : COLLEAGUES.cozy;
  if (!n || !DESKS.length) return;
  const Colleague = class Colleague extends Worker {
    constructor(cfg, deskIndex) {
      super(cfg, { id: `colleague-${deskIndex}` });
      this.colleague = true; this.deskIndex = deskIndex; this.offstage = true;
      this.root.visible = this.tagObj.visible = false;
      this.nextStir = rand(20, 90);
      npcs.push(this);
    }
    // their own desk, not a session's
    homeSpot() { return DESK_SPOTS[this.deskIndex] || null; }
    sitDown() {
      const seat = this.homeSpot();
      if (!seat) { this.hide(); return; }
      this.pos.set(seat.x, seat.z); this.spot = seat; this.face = this.faceTarget = seat.face;
      this.pose = seat.sit ? 'sit' : 'stand'; this.station = 'desk'; this.anim = 'type';
      this.offstage = false; this.root.visible = true; this.tagObj.visible = true;
      this.root.matrixWorldAutoUpdate = true;
    }
    hide() {
      this.offstage = true;
      if (this.root.visible || this.tagObj.visible) {
        this.root.visible = false; this.root.matrixWorldAutoUpdate = false;
        this.tagObj.visible = false; this.bubbleObj.visible = false;
      }
    }
    update(dt, t) {
      const hour = officeNow().getHours();
      const hours = isWorkday(officeNow()) && hour >= 8 && hour < 19;
      const taken = takenDesks();
      // a session wants this desk, or the day is over: step aside
      if (!hours || taken.has(this.deskIndex)) {
        if (!this.offstage) {
          const free = DESKS.map((_, i) => i).find((i) => !taken.has(i) && !people.some((p) => p !== this && !p.offstage && p.deskIndex === i));
          if (hours && free != null) { this.deskIndex = free; this.sitDown(); } else this.hide();
        }
        if (this.offstage) return;
      } else if (this.offstage) {
        this.sitDown();
      }
      // at the desk: mostly typing, now and then a stretch and a look around
      this.nextStir -= dt;
      if (this.nextStir <= 0) { this.anim = this.anim === 'type' ? 'idle' : 'type'; this.nextStir = this.anim === 'type' ? rand(30, 120) : rand(4, 12); }
      super.update(dt, t);
    }
  };
  const taken = takenDesks();
  const free = DESKS.map((_, i) => i).filter((i) => !taken.has(i));
  for (let k = 0; k < Math.min(n, free.length); k++) {
    const name = COLLEAGUE_NAMES[k % COLLEAGUE_NAMES.length];
    people.push(new Colleague({ name, shirt: SHIRTS[k % SHIRTS.length], hair: HAIR[k % HAIR.length] }, free[k]));
  }
}

/** Every colleague on the floor right now (the office's own people, never sessions). */
export const colleagues = () => people.filter((p) => !p.offstage);
