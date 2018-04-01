import AuthDataInterface from '../../interfaces/authdataInterface';

export default class OpenSubtitleAuth implements AuthDataInterface {
  private username: string;
  private password: string;
  private lang: string;
  private agent: string;
  private raw: any;
  public token: string;
  authenticated: boolean = false;

  constructor(username: string, password: string, lang: string, agent: string) {
    this.username = username;
    this.password = password;
    this.lang = lang;
    this.agent = agent;
  }

  getAuthData() {
    return [this.username, this.password, this.lang, this.agent];
  }

  setRaw(raw: any) {
    this.raw = raw;
  }

  getRaw(): any {
    return this.raw;
  }
}