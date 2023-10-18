function strip(num: number, precision = 12) {
  return +parseFloat(num.toPrecision(precision));
}
export const calculateBetaFunction = (alpha: number, beta: number) => {
  const data = [];
  for (let i = 0; i <= 50; ++i) {
    const x = strip(0.02 * i);
    const y = betaFunction(alpha, beta, x);
    data.push({ x, y, name: '2.35' });
  }
  return data;
};

const betaFunction = (alpha: number, beta: number, x: number) => {
  const numerator = Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1);
  const denominator = betaFunc(alpha, beta);
  return numerator / denominator;
};

const betaFunc = (alpha: number, beta: number) => {
  return (gamma(alpha) * gamma(beta)) / gamma(alpha + beta);
};

const gamma = (n: number): number => {
  if (n === 1) {
    return 1;
  }
  return (n - 1) * gamma(n - 1);
};