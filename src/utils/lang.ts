import * as Langs from 'langs';

export default class {
  private static available: string[] = ['1', '2', '2T', '2B', '3', 'name', 'local'];

  static getValue (field: string, code: string, array: string[] = this.available) {
    var name: string = code;
    let i: number = 0;

    for (; i < this.available.length; i++) {
      const d = this.available[i];
      if (Langs.has(d, code)) return Langs.where(d, code)[field];
    }

    return name;
  }

  static getName (code: string) {
    return this.getValue('name', code);
  }
  static getLocal (code: string) {
    return this.getValue('local', code);
  }
}