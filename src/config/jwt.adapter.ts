import jwt from "jsonwebtoken";
import { envs } from "./envs";
const JWT_SECRET = envs.JWT_SECRET;
export class JwtAdapter {
  static async generateToken(payload: any, duration: string = "2h") {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, JWT_SECRET, { expiresIn: duration }, (err, token) => {
        if (err) resolve(err);
        return resolve(token);
      });
    });
  }
  static validateToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return resolve(null);
        return resolve(decoded);
      });
    });
  }
}
