import { $t, i18next } from "../i18n";
import path from "path";
import fs from "fs-extra";
import { compress, decompress } from "../common/compress";
import iconv from "iconv-lite";
import { globalConfiguration } from "../entity/config";
import { ProcessWrapper } from "mcsmanager-common";
import os from "os";

const ERROR_MSG_01 = $t("TXT_CODE_system_file.illegalAccess");
const MAX_EDIT_SIZE = 1024 * 1024 * 5;

interface IFile {
  name: string;
  size: number;
  time: string;
  type: number;
  mode: number;
}

export default class FileManager {
  public cwd: string = ".";

  constructor(public topPath: string = "", public fileCode?: string) {
    if (!path.isAbsolute(topPath)) {
      this.topPath = path.normalize(path.join(process.cwd(), topPath));
    } else {
      this.topPath = path.normalize(topPath);
    }
    if (!fileCode) {
      this.fileCode = "utf-8";
      if (i18next.language == "zh_cn") this.fileCode = "gbk";
    }
  }

  isRootTopRath() {
    return this.topPath === "/" || this.topPath === "\\";
  }

  toAbsolutePath(fileName: string = "") {
    const topAbsolutePath = this.topPath;

    if (path.normalize(fileName).indexOf(topAbsolutePath) === 0) return fileName;

    let finalPath = "";
    if (os.platform() === "win32") {
      const reg = /^[A-Za-z]:[\/]/;
      if (reg.test(this.cwd)) {
        finalPath = path.normalize(path.join(this.cwd, fileName));
      } else if (reg.test(fileName)) {
        finalPath = path.normalize(fileName);
      } else {
        finalPath = path.normalize(path.join(this.topPath, this.cwd, fileName));
      }
      // 修复 C:\D: 这种错误路径
      finalPath = finalPath.replace(/^([A-Za-z]):\\([A-Za-z]):/, "$1:\\");
    } else {
      finalPath = path.normalize(path.join(this.topPath, this.cwd, fileName));
    }

    if (
      finalPath.indexOf(topAbsolutePath) !== 0 &&
      topAbsolutePath !== "/" &&
      topAbsolutePath !== "\\"
    )
      throw new Error(ERROR_MSG_01);
    return finalPath;
  }

  checkPath(fileNameOrPath: string) {
    if (this.isRootTopRath()) return true;
    const destAbsolutePath = this.toAbsolutePath(fileNameOrPath);
    const topAbsolutePath = this.topPath;
    return (
      destAbsolutePath.indexOf(topAbsolutePath) === 0 ||
      topAbsolutePath === "/" ||
      topAbsolutePath === "\\"
    );
  }

  // 其余代码保持原样...
}
