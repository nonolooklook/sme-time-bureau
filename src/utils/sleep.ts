export const sleep = (ms: number): Promise<any> => {
  // add ms millisecond timeout before promise resolution
  return new Promise((resolve) => setTimeout(resolve, ms));
};
