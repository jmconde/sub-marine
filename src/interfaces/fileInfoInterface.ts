export default interface FileInfo {
  fullPath: string,
  fullName: string,
  path: string,
  filename: string,
  extension: string,
  length?: number,
  hash?: string,
  langs?: string[],
  year?: string,
  episode?: number,
  season?: number,
  title?: string,
  type?: string
}