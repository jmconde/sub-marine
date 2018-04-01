export default interface AuthDataInterface {
  token: string;
  authenticated: boolean;
  getAuthData(): any;
}