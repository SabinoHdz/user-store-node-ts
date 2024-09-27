import { Request, Response } from "express";
import { CustomError, RegisterUserDto } from "../../domain";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";

export class AuthController {
  constructor(public readonly authService: AuthService) {}

  private handleErrors = (error: any, res: Response) => {
    if (error instanceof CustomError) {
      console.error(`error is instance of CustomError: ${error}`);
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  register = (req: Request, res: Response) => {
    const [error, registerUserDto] = RegisterUserDto.create(req.body);
    if (error) return res.status(400).json({ error });
    this.authService
      .registerUser(registerUserDto!)
      .then((user) => res.json(user))
      .catch((error) => {
        this.handleErrors(error, res);
      });
  };

  login = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.access(req.body);
    if (error) return res.status(400).json({ error });

    this.authService
      .loginUser(loginUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleErrors(error, res));
  };

  validateEmail = (req: Request, res: Response) => {
    const { token } = req.params;
    this.authService
      .validateEmail(token)
      .then(() => res.json("Email validated"))
      .catch((error) => this.handleErrors(error, res));
  };
}
