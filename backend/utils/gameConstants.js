export const MONEY_VALUES = [
  0, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 
  16000, 32000, 64000, 125000, 250000, 500000, 1000000
];

export const SAFE_POINTS = [0, 5, 10]; 


export function calculateMoneyAtStake(level) {
  return MONEY_VALUES[level] || 0;
}


export function calculateSecuredMoney(level) {
  if (level <= 0) return 0;
  
  for (let i = SAFE_POINTS.length - 1; i >= 0; i--) {
    if (level > SAFE_POINTS[i]) {
      return MONEY_VALUES[SAFE_POINTS[i]];
    }
  }
  
  return 0;
}