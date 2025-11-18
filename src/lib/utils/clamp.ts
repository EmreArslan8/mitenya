const clamp = (min: number, value: number, max: number) => {
  if (value < min) return min;
  else if (value > max) return max;
  else return value;
};

export default clamp;
