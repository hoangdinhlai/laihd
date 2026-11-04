// The supermarket on the block beside the office: a two-floor store with a car park in front, a glass front facing
// the office, and a floor you can see right into — aisles of goods, chilled cabinets along the back, three tills by
// the door, a produce island and a trolley bay. Its name and colours come from src/market.js.
//
// It stands on its own: the twelve street shops (shops.js) are rooms cut into the ground floor of the city's own
// buildings, while this one takes a whole block the city would otherwise leave as a park, so nothing about the
// street's lots had to change for it. city.js reserves that block and calls buildMarket once.
//
// Everything here is merged into a handful of meshes (the shell and its fittings by vertex colour, the glass apart,
// the lit panels apart again so night can switch them on), so the whole store costs a few draw calls. The people are
// one instanced crowd (street-folk.js), the same as the street's.
import * as THREE from 'three';
import { MARKET } from '../../../market.js';
import { canvasTex, mat } from '../../scene/blocks.js';
import { BULB_OFF, GY, boxAt, colorize, cR, cr, mergeAll, vmat } from '../terrace.js';
import { folk } from './street-folk.js';

const FL = 0.12;            // the floor, level with the pavement
const CEIL = 3.0;           // the shop floor's ceiling
const TOP = 6.6;            // the parapet
const FONT = '"Be Vietnam Pro", system-ui, sans-serif';
const TILE_A = '#EDEFF1', TILE_B = '#E0E3E7';
const SHELF = '#D8DCE1', SHELF_DARK = '#B9C0C8';
const GOODS = ['#E4572E', '#F2B705', '#3B8EA5', '#5BA85A', '#C94C7C', '#7B5EA7', '#E8833A', '#2E9E8F', '#D94F4F', '#4A80C9'];

/* ---------- the sign over the door, and the one on the roof ---------- */
function signTex(w, h, big) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = MARKET.face; g.fillRect(0, 0, w, h);
    g.fillStyle = MARKET.accent; g.fillRect(0, h - h * 0.08, w, h * 0.08);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,255,255,.82)'; g.font = `700 ${Math.round(h * 0.17)}px ${FONT}`;
    g.fillText(MARKET.sub, w / 2, h * 0.26);
    g.fillStyle = '#FFFFFF'; g.font = `900 ${Math.round(h * (big ? 0.46 : 0.4))}px ${FONT}`;
    g.fillText(MARKET.name, w / 2, h * 0.58);
    if (!big) { g.fillStyle = MARKET.accent; g.font = `600 ${Math.round(h * 0.11)}px ${FONT}`; g.fillText(MARKET.tag, w / 2, h * 0.87); }
  });
}

/* ---------- the store ---------- */
/** Builds the supermarket inside the block [x0,x1] x [z0,z1]; its door faces -x, toward the office. */
export function buildMarket(G, x0, x1, z0, z1) {
  const grp = new THREE.Group(); grp.name = 'market'; grp.userData.noMerge = true; G.add(grp);
  const solid = [], glass = [], lit = [], signs = [];
  const b = (w, h, d, x, y, z, c) => solid.push(boxAt(w, h, d, x, GY + y, z, c));
  const pane = (w, h, x, y, z, ry = 0) => glass.push(new THREE.PlaneGeometry(w, h).rotateY(ry).translate(x, GY + y, z));
  const panel = (w, d, x, y, z) => lit.push(boxAt(w, 0.04, d, x, GY + y, z, '#FFF8E6'));

  // the ground: the block's pavement, then the forecourt's asphalt and its painted bays
  const FRONT = x0 + 3.2;                       // where the building starts; everything west of it is the car park
  const bx0 = FRONT, bx1 = x1 - 0.4, bz0 = z0 + 0.4, bz1 = z1 - 0.4;
  const W = bz1 - bz0, D = bx1 - bx0;           // the store: W across (z), D deep (x)
  const cz = (bz0 + bz1) / 2;
  solid.push(boxAt(x1 - x0, 0.12, z1 - z0, (x0 + x1) / 2, GY + 0.06, (z0 + z1) / 2, '#8D939B'));
  b(FRONT - x0 - 0.3, 0.02, z1 - z0 - 0.8, (x0 + FRONT) / 2 - 0.15, 0.13, (z0 + z1) / 2, '#4A4F57');
  for (let z = z0 + 1.4; z < z1 - 1.2; z += 2.4) b(2.4, 0.01, 0.08, x0 + 1.6, 0.145, z, '#E8E8E4');   // the bays
  b(0.08, 0.01, z1 - z0 - 2.4, x0 + 2.9, 0.145, (z0 + z1) / 2, '#E8E8E4');

  /* ---------- the shell: two floors, a parapet, and the glass front ---------- */
  const wall = '#F4F2ED';
  b(D, CEIL + 0.2, 0.3, (bx0 + bx1) / 2, (CEIL + 0.2) / 2 + FL, bz0 - 0.15, wall);          // the two side walls
  b(D, CEIL + 0.2, 0.3, (bx0 + bx1) / 2, (CEIL + 0.2) / 2 + FL, bz1 + 0.15, wall);
  b(0.3, CEIL + 0.2, W + 0.6, bx1 + 0.15, (CEIL + 0.2) / 2 + FL, cz, wall);                 // the back wall
  b(D + 0.3, 0.26, W + 0.6, (bx0 + bx1) / 2 + 0.15, CEIL + FL + 0.13, cz, '#E6E3DC');       // the slab between the floors
  b(D + 0.3, TOP - CEIL - 0.4, W + 0.6, (bx0 + bx1) / 2 + 0.15, (TOP + CEIL) / 2 + FL - 0.07, cz, wall);   // the floor above
  b(D + 0.5, 0.34, W + 0.8, (bx0 + bx1) / 2 + 0.1, TOP + FL + 0.17, cz, '#D7D3CB');         // the parapet
  for (const [dx, dz, s] of [[1.1, -2.6, 1.0], [2.4, 1.8, 0.8], [3.6, -0.6, 0.9]]) {        // the plant on the roof
    b(s, 0.5, s, bx0 + dx + 0.6, TOP + FL + 0.6, cz + dz, '#9BA3AC');
    b(s * 0.7, 0.14, s * 0.7, bx0 + dx + 0.6, TOP + FL + 0.92, cz + dz, '#7E8691');
  }
  // the windows of the floor above: a band of glass in a frame
  for (let z = bz0 + 0.9; z < bz1 - 0.6; z += 1.9) {
    b(0.12, 1.5, 0.14, bx0 - 0.05, CEIL + 1.35 + FL, z - 0.1, '#C9C5BD');
    pane(1.6, 1.4, bx0 - 0.12, CEIL + 1.35 + FL, z + 0.85, Math.PI / 2);
  }
  b(0.16, 0.22, W + 0.6, bx0 - 0.06, CEIL + 2.25 + FL, cz, '#C9C5BD');
  b(0.16, 0.22, W + 0.6, bx0 - 0.06, CEIL + 0.5 + FL, cz, '#C9C5BD');

  /* ---------- the glass front, and the doors in the middle of it ---------- */
  const DOOR = 1.1;                              // half the opening
  b(0.18, 0.3, W + 0.6, bx0 - 0.05, FL + 0.15, cz, '#9AA2AD');                 // the sill
  b(0.18, 0.34, W + 0.6, bx0 - 0.05, CEIL - 0.05 + FL, cz, '#8F97A2');         // the head
  for (const z of [bz0, cz - DOOR, cz + DOOR, bz1]) b(0.14, CEIL - 0.5, 0.12, bx0 - 0.03, (CEIL - 0.5) / 2 + FL + 0.25, z, '#8F97A2');
  for (let z = bz0 + 1.3; z < cz - DOOR - 0.4; z += 1.3) b(0.1, CEIL - 0.5, 0.07, bx0 - 0.03, (CEIL - 0.5) / 2 + FL + 0.25, z, '#A7AEB7');
  for (let z = cz + DOOR + 0.4; z < bz1 - 0.6; z += 1.3) b(0.1, CEIL - 0.5, 0.07, bx0 - 0.03, (CEIL - 0.5) / 2 + FL + 0.25, z, '#A7AEB7');
  pane(cz - DOOR - bz0, CEIL - 0.6, bx0 - 0.02, (CEIL - 0.6) / 2 + FL + 0.3, (bz0 + cz - DOOR) / 2, Math.PI / 2);
  pane(bz1 - cz - DOOR, CEIL - 0.6, bx0 - 0.02, (CEIL - 0.6) / 2 + FL + 0.3, (bz1 + cz + DOOR) / 2, Math.PI / 2);
  // the two sliding leaves, parked open against the jambs
  const leaves = new THREE.Group(); grp.add(leaves);
  for (const s of [-1, 1]) {
    const leaf = new THREE.Mesh(mergeAll([boxAt(0.08, CEIL - 0.6, DOOR - 0.06, 0, 0, 0, '#9AA2AD')]), vmat());
    leaf.position.set(bx0 - 0.02, GY + (CEIL - 0.6) / 2 + FL + 0.3, cz + s * (DOOR / 2));
    leaf.userData.noCollide = true; leaves.add(leaf);
  }

  /* ---------- the sign over the door, and the one standing on the roof ---------- */
  const SIGN_H = 1.0;
  b(D * 0.1 + 0.3, SIGN_H + 0.12, W + 0.7, bx0 - 0.14, CEIL + 0.62 + FL, cz, '#167A42');
  const signM = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.5, SIGN_H), mat('#FFFFFF', { map: signTex(1024, 220, false), roughness: 0.7 }));
  signM.rotation.y = -Math.PI / 2; signM.position.set(bx0 - 0.33, GY + CEIL + 0.62 + FL, cz);
  signM.userData.noCollide = true; grp.add(signM); signs.push(signM);
  // on the roof, facing the office, on two legs
  for (const s of [-1, 1]) b(0.16, 1.1, 0.16, bx0 + 0.7, TOP + FL + 0.9, cz + s * 2.1, '#9BA3AC');
  const roofM = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.3), mat('#FFFFFF', { map: signTex(1024, 240, true), roughness: 0.7 }));
  roofM.rotation.y = -Math.PI / 2; roofM.position.set(bx0 + 0.6, GY + TOP + FL + 1.75, cz);
  roofM.userData.noCollide = true; grp.add(roofM); signs.push(roofM);
  b(0.2, 1.5, 5.8, bx0 + 0.68, TOP + FL + 1.75, cz, '#146B3A');

  /* ---------- the floor inside: tiles, the ceiling and its light panels ---------- */
  for (let x = bx0; x < bx1 - 0.01; x += 0.7) for (let z = bz0; z < bz1 - 0.01; z += 0.7) {
    const w = Math.min(0.7, bx1 - x), d = Math.min(0.7, bz1 - z);
    solid.push(colorize(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(x + w / 2, GY + FL + 0.005, z + d / 2),
      (Math.round((x - bx0) / 0.7) + Math.round((z - bz0) / 0.7)) % 2 ? TILE_A : TILE_B));
  }
  b(D, 0.06, W, (bx0 + bx1) / 2, CEIL - 0.03 + FL, cz, '#F7F7F5');
  for (let x = bx0 + 0.9; x < bx1 - 0.4; x += 1.7) for (let z = bz0 + 1.0; z < bz1 - 0.6; z += 2.0) panel(1.3, 0.34, x, CEIL - 0.08 + FL, z);

  /* ---------- the fittings ---------- */
  const AISLE_X0 = bx0 + 1.7, AISLE_X1 = bx1 - 1.0;   // the gondolas run back from the tills to the cabinets
  const aisles = [];
  for (let k = 0; k < 4; k++) {
    const z = cz - 2.7 + k * 1.8;
    aisles.push(z);
    b(0.9, 0.12, AISLE_X1 - AISLE_X0, (AISLE_X0 + AISLE_X1) / 2, FL + 0.06, z, SHELF_DARK);
    b(0.08, 1.55, AISLE_X1 - AISLE_X0, (AISLE_X0 + AISLE_X1) / 2, FL + 0.9, z, SHELF);
    for (const y of [0.42, 0.78, 1.14, 1.48]) {
      b(0.88, 0.05, AISLE_X1 - AISLE_X0, (AISLE_X0 + AISLE_X1) / 2, FL + y, z, SHELF);
      for (let x = AISLE_X0 + 0.16; x < AISLE_X1 - 0.1; x += 0.3) for (const s of [-1, 1]) {
        const h = 0.16 + cr() * 0.1, w = 0.1 + cr() * 0.12;
        b(w, h, 0.22, x, FL + y + h / 2 + 0.025, z + s * 0.2, GOODS[Math.floor(cr() * GOODS.length)]);
      }
    }
    // the aisle's hanging number
    b(0.5, 0.26, 0.04, (AISLE_X0 + AISLE_X1) / 2, CEIL - 0.42 + FL, z, MARKET.face);
  }
  // the chilled cabinets along the back wall: a lit inside behind glass, bottles in rows
  for (let z = bz0 + 0.8; z < bz1 - 1.0; z += 1.25) {
    b(0.7, 2.0, 1.2, bx1 - 0.38, FL + 1.0, z + 0.6, '#CDD3DA');
    b(0.5, 1.6, 1.04, bx1 - 0.45, FL + 1.0, z + 0.6, '#E9F3F6');
    for (const y of [0.5, 0.9, 1.3, 1.68]) for (let q = 0; q < 4; q++) {
      solid.push(colorize(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 7).translate(bx1 - 0.52, GY + FL + y, z + 0.18 + q * 0.28), GOODS[Math.floor(cr() * GOODS.length)]));
    }
    pane(1.04, 1.6, bx1 - 0.72, FL + 1.0, z + 0.6, Math.PI / 2);
    lit.push(boxAt(0.02, 1.5, 1.0, bx1 - 0.7, GY + FL + 1.0, z + 0.6, '#DFF2F6'));
  }
  // the produce island at the far end, crates of fruit and veg on a slope
  for (let k = 0; k < 2; k++) {
    const z = bz1 - 1.5, x = bx0 + 2.2 + k * 1.5;
    b(1.2, 0.72, 1.1, x, FL + 0.36, z, '#8B6A4A');
    for (const [dx, dz, c] of [[-0.3, -0.26, '#E24A33'], [0.3, -0.26, '#5BA85A'], [-0.3, 0.26, '#F2B705'], [0.3, 0.26, '#E8833A']]) {
      b(0.52, 0.16, 0.46, x + dx, FL + 0.8, z + dz, '#A8835E');
      for (let q = 0; q < 5; q++) solid.push(colorize(new THREE.SphereGeometry(0.075, 6, 5).translate(x + dx + cR(-0.16, 0.16), GY + FL + 0.9, z + dz + cR(-0.14, 0.14)), c));
    }
  }
  // three tills across the front, each a counter, a belt, a screen and a lamp
  const tills = [];
  for (let k = 0; k < 3; k++) {
    const z = bz0 + 1.1 + k * 1.5, x = bx0 + 1.0;
    tills.push([x, z]);
    b(0.8, 0.9, 1.05, x, FL + 0.45, z, '#E7E9EC');
    b(0.84, 0.06, 1.0, x, FL + 0.92, z, MARKET.face);
    b(0.5, 0.05, 0.9, x + 0.55, FL + 0.86, z, '#3A4049');                    // the belt
    b(0.3, 0.26, 0.24, x - 0.1, FL + 1.08, z - 0.3, '#2E333B');              // the screen
    b(0.1, 0.5, 0.1, x - 0.28, FL + 1.2, z + 0.42, '#9BA3AC');
    lit.push(boxAt(0.22, 0.08, 0.22, x - 0.28, GY + FL + 1.46, z + 0.42, '#FFF3D6'));
  }
  // the trolley bay just inside the door, and a row of them out on the forecourt
  const trolley = (x, z, yaw) => {
    const t = [];
    const tb = (w, h, d, dx, dy, dz, c) => t.push(boxAt(w, h, d, dx, dy, dz, c));
    tb(0.46, 0.04, 0.66, 0, 0.56, 0, '#AEB6BF');
    for (const s of [-1, 1]) tb(0.04, 0.34, 0.66, s * 0.21, 0.73, 0, '#AEB6BF');
    tb(0.46, 0.34, 0.04, 0, 0.73, -0.31, '#AEB6BF');
    tb(0.46, 0.07, 0.07, 0, 0.9, 0.3, MARKET.face);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tb(0.07, 0.1, 0.07, sx * 0.18, 0.05, sz * 0.26, '#3A4049');
    const geo = mergeAll(t); geo.rotateY(yaw); geo.translate(x, GY + FL, z);
    solid.push(geo);
  };
  for (let k = 0; k < 4; k++) trolley(bx0 + 0.75, bz1 - 1.0 - k * 0.42, Math.PI / 2);
  for (let k = 0; k < 5; k++) trolley(x0 + 1.1, z0 + 1.3 + k * 0.4, Math.PI / 2);
  b(0.1, 1.1, 2.4, x0 + 1.55, FL + 0.55, z0 + 2.0, '#9BA3AC');

  /* ---------- the lamps over the car park ---------- */
  for (const z of [z0 + 2.2, z1 - 2.2]) {
    b(0.16, 3.4, 0.16, x0 + 1.5, 1.7, z, '#6F767F');
    b(0.9, 0.12, 0.3, x0 + 1.85, 3.42, z, '#6F767F');
    lit.push(boxAt(0.7, 0.06, 0.24, x0 + 2.1, GY + 3.34, z, '#FFF1CF'));
  }

  /* ---------- merged into a handful of meshes ---------- */
  const shell = new THREE.Mesh(mergeAll(solid), vmat({ roughness: 0.88 }));
  shell.castShadow = shell.receiveShadow = true; grp.add(shell);
  const glassM = new THREE.Mesh(mergeAll(glass), mat('#BBD6E4', { transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide }));
  glassM.userData.noCollide = true; grp.add(glassM);
  const litMat = vmat({ emissive: '#FFF6E2', emissiveIntensity: 0 });
  const litM = new THREE.Mesh(mergeAll(lit), litMat); litM.userData.noCollide = true; grp.add(litM);

  /* ---------- the people: cashiers, someone filling the shelves, a guard, and shoppers ---------- */
  const SHOPPERS = 5;
  const crowd = folk(grp, SHOPPERS + 4, { low: false, shadows: false });
  const [g1, g2, g3] = crowd.take(3);                 // two cashiers and the guard
  const [stacker] = crowd.take(1);
  const shoppers = crowd.take(SHOPPERS);
  const UNIFORM = { shirt: MARKET.face, pants: '#2B2F36', hair: '#2B2420' };
  for (const i of [g1, g2, stacker]) crowd.dress(i, UNIFORM);
  crowd.dress(g3, { shirt: '#3A4049', pants: '#2B2F36', hair: '#2B2420' });
  const SHOP_LOOK = [{ shirt: '#D96C6C', pants: '#3A3F47' }, { shirt: '#4F86C6', pants: '#2E333B' }, { shirt: '#E6C25A', pants: '#4A4F57' },
    { shirt: '#6FAE7E', pants: '#333842' }, { shirt: '#B07CC6', pants: '#2B2F36' }];
  shoppers.forEach((i, k) => crowd.dress(i, { ...SHOP_LOOK[k % SHOP_LOOK.length], hair: ['#2B2420', '#4A3524', '#1C1A18'][k % 3] }));

  // each shopper walks a round: in at the door, down an aisle, along the back, to a till, out again
  const routes = shoppers.map((i, k) => {
    const z = aisles[k % aisles.length], [tx, tz] = tills[k % tills.length];
    return { i, t: cr() * 10, pts: [[bx0 - 1.4, cz], [bx0 + 0.9, cz], [bx0 + 1.4, z - 0.75], [AISLE_X1 - 0.6, z - 0.75],
      [AISLE_X1 - 0.6, z + 0.75], [bx0 + 1.5, z + 0.75], [tx + 0.9, tz], [bx0 - 1.4, cz + 1.2]] };
  });
  const legLen = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const open = () => { const h = new Date().getHours(); return h >= MARKET.hours[0] && h < MARKET.hours[1]; };

  function update(dt, t) {
    const on = open();
    // the staff: the cashiers behind their tills, the guard by the door, the stacker at a shelf
    crowd.pose(g1, { x: tills[0][0] - 0.75, y: GY + FL, z: tills[0][1], yaw: Math.PI / 2, arms: [[0.3, 0.2], [-0.3, 0.2]] });
    crowd.pose(g2, { x: tills[1][0] - 0.75, y: GY + FL, z: tills[1][1], yaw: Math.PI / 2, arms: [[0.2, 0.5 + Math.sin(t * 1.6) * 0.3], [-0.2, 0.3]] });
    crowd.pose(g3, { x: bx0 - 0.9, y: GY + FL, z: cz - 1.9, yaw: Math.PI / 2 + Math.sin(t * 0.3) * 0.5, arms: [[0.1, 0], [-0.1, 0]] });
    crowd.pose(stacker, { x: AISLE_X0 + 1.2, y: GY + FL, z: aisles[1] - 0.72, yaw: -Math.PI / 2,
      arms: [[0.2, 0.9 + Math.sin(t * 2.1) * 0.5], [-0.2, 0.6]], lean: 0.12 });
    // the shoppers walk their round while the store is open; when it shuts they are simply not there
    for (const r of routes) {
      if (!on) { crowd.pose(r.i, { x: 0, y: -40, z: 0 }); continue; }
      r.t += dt;
      let total = 0; for (let q = 0; q < r.pts.length - 1; q++) total += legLen(r.pts[q], r.pts[q + 1]);
      let d = (r.t * 0.85) % total;                    // 0.85 m/s, once round and out again
      let p = r.pts[0], q = r.pts[1];
      for (let k = 0; k < r.pts.length - 1; k++) {
        const L = legLen(r.pts[k], r.pts[k + 1]);
        if (d <= L) { p = r.pts[k]; q = r.pts[k + 1]; break; }
        d -= L;
      }
      const L = Math.max(0.001, legLen(p, q)), u = d / L;
      const x = p[0] + (q[0] - p[0]) * u, z = p[1] + (q[1] - p[1]) * u;
      const sw = Math.sin(r.t * 4.2) * 0.5;
      crowd.pose(r.i, { x, y: GY + FL, z, yaw: Math.atan2(q[0] - p[0], q[1] - p[1]) + Math.PI / 2,
        arms: [[0.1, sw], [-0.1, -sw]], legs: [sw, -sw], bob: Math.abs(Math.sin(r.t * 4.2)) * 0.02 });
    }
    crowd.flush();
  }

  function night(on) {
    litMat.emissiveIntensity = on ? 1.1 : 0.25;
    for (const s of signs) s.material.emissive = new THREE.Color(on ? MARKET.face : '#000000');
    for (const s of signs) s.material.emissiveIntensity = on ? 0.55 : 0;
    shell.material.emissive = new THREE.Color('#000000');
    glassM.material.opacity = on ? 0.14 : 0.22;
    litM.visible = true;
    void BULB_OFF;
  }

  return { update, night, group: grp };
}
