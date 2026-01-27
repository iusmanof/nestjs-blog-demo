export class MeViewDto {
  email: string;
  login: string;
  userId: string;

  static map(user: { email: string; login: string; _id: string }): MeViewDto {
    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }
}
