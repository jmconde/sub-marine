import AuthDataInterface from "../../interfaces/authdataInterface";
import { getRequestMessage } from "./opensubtitle-utils";

export default class OpenSubtitleAuth implements AuthDataInterface {
  private data: any;

  constructor(username: string, password: string, lang: string, agent: string) {
    this.data = getRequestMessage('LogIn',  [username, password, lang, agent]);
  }

  getAuthData() {
    return this.data;
  }
}