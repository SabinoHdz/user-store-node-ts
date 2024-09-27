import { compareSync, genSaltSync, hashSync } from "bcrypt";
export const bcyptAdapter = {
  hash: (password: string) => {
    const salt = genSaltSync();
    return hashSync(password, salt);
  },
  compare: (password: string, hash: string) => {
    return compareSync(password, hash);
  },
};
