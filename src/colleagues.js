// The colleagues: people at the desks your sessions are not using, so the floor looks busy even with one session
// open. They are decoration — a real Claude Code session always takes the desk first, and a colleague sitting
// there gets up and moves along. The session list on the left only ever shows real sessions.
//
// Set a count to 0 for an office with only your own sessions in it.
export const COLLEAGUES = {
  cozy: 3,    // the one-room office (9 desks)
  pro: 6,     // the company floor (12 desks), and the headquarters wing with it
};

// What they are called. Short names sit better on a name tag.
export const COLLEAGUE_NAMES = ['Mai', 'Nam', 'Linh', 'Huy', 'Trang', 'Khoa', 'Thảo', 'Dũng', 'Hà', 'Phúc', 'Vy', 'Sơn'];

export default COLLEAGUES;
