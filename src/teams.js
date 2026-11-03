// What each project's pod is called on the office floor. Without an entry here a pod is named after the folder
// its sessions work in, so "~/Desktop/mamnon-reco-kids" reads "Team mamnon-reco-kids"; with one it reads the
// name you give it.
//
// The key is the project's folder name (the last part of the path) or its git repository name, whichever the
// office found; matching ignores case. The value is what the pod's chip, its door plaque in a department room
// and its tooltip all say.
export const TEAMS = {
  'mamnon-reco-kids': 'TQT',
};

/** The name a pod goes by: whatever TEAMS says for this project, else the project's own name. */
export const teamName = (proj) => TEAMS[String(proj || '').toLowerCase()] || proj;

export default TEAMS;
