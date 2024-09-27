import { regularExp } from "../../../config";

export class LoginUserDto {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static access(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;

    if (!email) return ["Mising email"];
    if (!regularExp.email.test(email)) return ["email is not valid"];
    if (!password) return ["Missing password"];
    //if (password.length < 6) return ["Password must be at least 6 characters"];
    return [undefined, new LoginUserDto(email, password)];
  }
}
