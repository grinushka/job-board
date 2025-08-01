export const getNameInitials = (name: string, firstCount = 2) =>
  name
    .split(" ")
    .slice(0, firstCount)
    .map(str => str[0])
    .join("");
