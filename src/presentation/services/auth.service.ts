import { bcyptAdapter, JwtAdapter } from "../../config";
import { envs } from "../../config/envs";
import { UserModel } from "../../data";
import { CustomError, RegisterUserDto, UserEntity } from "../../domain";
import { LoginUserDto } from "../../domain/dtos/auth/login-user.dto";
import { EmailService } from "./email.service";

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({
      email: registerUserDto.email,
    });

    if (existUser) throw CustomError.badRequest("Email already exists");
    try {
      const user = new UserModel(registerUserDto);
      /// encrypt password
      user.password = bcyptAdapter.hash(registerUserDto.password);

      await user.save();
      //Email validation
      await this.sendEmailValidationLink(user.email);
      const { password, ...userEntity } = UserEntity.fromObject(user);
      const token = await JwtAdapter.generateToken({ id: userEntity.id });

      if (!token) throw CustomError.internal("Error generating token");

      return { user: userEntity, token };
    } catch (error) {
      throw CustomError.internal(`${error}`);
    }
  }
  public async loginUser(loginUserDto: LoginUserDto) {
    // Check if user already exists

    const user = await UserModel.findOne({
      email: loginUserDto.email,
    });

    if (!user) throw CustomError.badRequest("Email and password do not match");
    //isMatch password
    const isMatch = bcyptAdapter.compare(loginUserDto.password, user.password);
    if (!isMatch)
      throw CustomError.badRequest("Email and password do not match");

    const { password, ...userEntity } = UserEntity.fromObject(user);
    const token = await JwtAdapter.generateToken({ id: userEntity.id });

    if (!token) throw CustomError.internal("Error generating token");

    return { user: userEntity, token };
  }

  public validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token);
    if (!payload) throw CustomError.badRequest("Invalid token");
    const { email } = payload as { email: string };
    if (!email) throw CustomError.internal("Email not in token");

    const user = await UserModel.findOne({ email });
    if (!user) throw CustomError.internal("Email not exists");

    user.emailValidated = true;
    await user.save();
    return true;
  };
  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw CustomError.internal("Error generating token");

    const link = `${envs.WEBSITE_URL}/auth/validate-email/${token}`;
    const html = `<h1>Validate your email</h1>
    <p>Click on the following link to validate your email</p>
    <a href="${link}">Validate your email: ${email} </a>`;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };
    const isSend = await this.emailService.sendEmail(options);
    if (!isSend) throw CustomError.internal("Error sending email");
    return true;
  };
}
