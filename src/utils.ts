import mime from 'mime';

const fs = window.require('fs');
const pathModule = window.require('path');

export type FileType = "audio" | "video" | "image" | "document" | "code";

export interface IFile {
  name: string;
  size: string | null;
  directory: boolean;
  mimeType: string | null;
  fullPath: string;
};

export const formatSize = (size : number) : string => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${["B", "kB", "MB", 'TB'][i]}`
}

export const getFiles = (path: string) : IFile[] => fs.readdirSync(path).map((file: string) : IFile => {
  const stats = fs.statSync(pathModule.join(path, file));
  const fullPath = pathModule.join(path, file);
  const mimeType = mime.getType(`${path}/${file}`);
  return {
    name: file,
    size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
    directory: stats.isDirectory(),
    mimeType: stats.isDirectory() ? 'directory' : mimeType,
    fullPath
  }
}).sort((a: IFile, b: IFile) : number => {
  if (a.directory === b.directory)
    return a.name.localeCompare(b.name);
  return a.directory ? -1 : 1
});

const getIFile = (path: string, file: File) : IFile => {
  const stats = fs.statSync(pathModule.join(path, file.name));
  const fullPath = pathModule.join(path, file);
  const mimeType = mime.getType(`${path}/${file.name}`);
  return {
    name: file.name, fullPath,
    size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
    directory: stats.directory,
    mimeType: stats.isDirectory() ? 'directory' : mimeType
  }
}

export const truncate = (text : string, limit : number) : string => {
  if (text.length < limit) return text;
  else return `${text.slice(0, limit)}...`
}

export function drawVisualiser(
  ctx: CanvasRenderingContext2D,
  bufferLength : number, x : number,
  barWidth : number, barHeight: number,
  dataArray: number[], cw: number,
  ch: number
) : void {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    const [red, green, blue] = [i * (barHeight / 30), i / 2, barHeight];
    ctx.fillStyle = `white`;
    ctx.fillRect(cw / 2 - x, ch - barHeight - 30, barWidth, 15);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fillRect(cw / 2 - x, ch - barHeight, barWidth, barHeight);
    x += barWidth;
  }
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 2;
    const [red, green, blue] = [i * (barHeight / 30), i / 2, barHeight];
    ctx.fillStyle = `white`;
    ctx.fillRect(x, ch - barHeight - 30, barWidth, 15);
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fillRect(x, ch - barHeight, barWidth, barHeight);
    x += barWidth;
  }
}

export function circleVisualiser(
  ctx: CanvasRenderingContext2D,
  bufferLength : number, x : number,
  barWidth : number, barHeight: number,
  dataArray: Uint8Array, cw: number,
  ch: number
): void {
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] * 0.75 + /* centralized circle */ 5;
    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(i * Math.PI * 4 / bufferLength)
    // const [red, green, blue] = [i * (barHeight / 30), i / 2, barHeight];
    const [h,s,l] = [i, 100, 50]
    ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
    ctx.fillRect(0, 0, barWidth, barHeight);
    x += barWidth;
    ctx.restore();
  }
}

const imgs = ["gif", "webp", "avif", "png", "svg", "apng", "jpeg", "jpg", "tiff", "icon", "ico",]
const sounds = ["aiff", "flac", "aac", "mp3", "ogg", "pcm", "wav", "dsd", "m4a", "mp2", "mpeg-4", "ape", "wma", "ac3", "au"];
const vids = ["avi", "wmv", "mkv", "mp4", "flv", "mov", "webm"];
const docs = ["pdf", "doc", "docx" , "odt" , "xls" , "xlsx" , "ods" , "ppt" , "pptx"];
const code = [
  "ada", "adb", "ads", "asm", "bas", "bash", "sh", "bat", "bin",
  "c", "cpp", "cs", "go", "f", "h", "hh", "htm", "html", "xml",
  "xhtml", "java", "js", "ts", "jsx", "tsx", "css", "less", "sass",
  "scss", "lisp", "lua", "nim", "php", "pl", "py", "rb", "r", "rb",
  "scala", "swg", "swift", "v", "vb", "vcxproj", "wasm", "zsh"
]

const getExt = (name: string) : string => name.split(".")[name.split(".").length - 1];

export function getMediaByType(files: FileList | null, type: string) : File[] {
  let items = [];
  if (!files) return [];
  // const stats = fs.statSync(pathModule.join(path, file));
  // // @ts-ignore
  // const mimeType = mime.getType(`${path}/${file}`);
  // return {
  //   name: file,
  //   size: stats.isFile() ? formatSize(stats.size ?? 0) : null,
  //   directory: stats.isDirectory(),
  //   mimeType: stats.isDirectory() ? 'directory' : mimeType
  // }
  for (const file of Array.from(files)) {
    if (type.includes('image') && imgs.includes(getExt(file.name))) items.push(file);
    if (type.includes('audio') && sounds.includes(getExt(file.name))) items.push(file);
    if (type.includes('video') && vids.includes(getExt(file.name))) items.push(file);
    if (type.includes('document') && docs.includes(getExt(file.name))) items.push(file);
    if (type.includes('code') && code.includes(getExt(file.name))) items.push(file);
  }
  return items;
}

export function getMediaInDir(path: string, files: File[] | null, type: FileType) : IFile[] | null {
  let items = [];
  if (!files) return null;
  for (const file of files) {
    if (type.includes('image') && imgs.includes(getExt(file.name))) items.push(getIFile(path, file));
    if (type.includes('audio') && sounds.includes(getExt(file.name))) items.push(getIFile(path, file));
    if (type.includes('video') && vids.includes(getExt(file.name))) items.push(getIFile(path, file));
    if (type.includes('document') && docs.includes(getExt(file.name))) items.push(getIFile(path, file));
    if (type.includes('code') && code.includes(getExt(file.name))) items.push(getIFile(path, file));
  }
  return items;
}

export function isFileOfType(file: File | IFile, type: string) : boolean {
  if (type.includes('image') && imgs.includes(getExt(file.name))) return true;
  if (type.includes('audio') && sounds.includes(getExt(file.name))) return true;
  if (type.includes('video') && vids.includes(getExt(file.name))) return true;
  return false;
}

export const padNum = (x: number) : string => x < 10 ? `0${x}` : x.toString();
export const formatTrackTime = (duration: number) : string => duration < 60 ? `0:${padNum(duration)}` : `${Math.floor(duration / 60)}:${padNum(duration % 60)}`;
export const getAllFilesOfType = (files: IFile[], type: FileType | "directory" | "*" | "all") : IFile[] => {
  if (type === 'directory') return files.filter((s: IFile) : boolean => s.directory);
  if (type === '*' || type === 'all') return files;
  return files.filter((s: IFile) : boolean => !!s.mimeType?.includes(type));
}

export const getBase64Image = (path: string) => fs.readFileSync(path, { encoding: 'base64', flag: 'r' });
export const barWidth = 1;
export const FFT_SIZE = 2048;
export const filter : string = `blur(5px) contrast(200%) hue-rotate(45deg) invert(25%) saturate(100%) sepia(10%)`;
