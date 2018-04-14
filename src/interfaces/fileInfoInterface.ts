export default interface FileInfo {
  fullPath: string,
  fullName: string,
  path: string,
  filename: string,
  extension: string,
  length?: number,
  hashes?: any,
  langs?: string[],
  year?: string,
  episode?: number,
  season?: number,
  title?: string,
  type?: string
}