import { IFile } from "../utils"
import { isFileOfType, truncate } from "../utils";
import { IconFolder, IconFolderOpen, getIcon } from "./Icons"

type FVProps = {
  files: IFile[],
  onBack: Function,
  onOpen: Function,
  size?: number | string;
  play: Function;
  pause: Function;
  isPlaying: null | File | IFile;
  setIsPlaying: Function;
  drawImage: Function;
  allFiles: null | FileList | File[];
  activeImage: null | IFile,
  isUl?: boolean;
}

function FilesViewer({ drawImage, isUl, files, onBack, onOpen, size, play, pause, isPlaying, setIsPlaying, allFiles, activeImage }: FVProps): JSX.Element {
  const style = {
    width: size ? size : '100%',
    borderRight: size ? "1px solid white" : "none",
  };

  const handleClick = (file: IFile) => {
    const img : HTMLImageElement = document.getElementById('display-image') as HTMLImageElement;
    if (file.directory) onOpen(file.name);
    if (isPlaying?.name !== file.name && Array.isArray(allFiles))
      setIsPlaying(() => allFiles.find(am => am.name === file.name));
    if (isPlaying?.name === file.name) pause();
    if (!isFileOfType(file, "image") && img.src.length > 0) img.src = "";
    if (isFileOfType(file, 'audio')) play(file.name);
    if (isFileOfType(file, 'image')) drawImage(file.fullPath, file.mimeType);
  }

  return (
    <table className="table m-0" style={style}>
      <tbody>
        {!isUl && (
          <tr className="clickable" onClick={() => onBack()}>
            <td className="icon-row p-1">
              <IconFolderOpen />
            </td>
            <td>...</td>
            <td></td>
          </tr>
        )}
        {files.map(({ name, directory, size, mimeType, fullPath } : IFile, index: number) => (
          <tr key={`${name}-${index}-${crypto.randomUUID()}`} className="clickable position-relative" onClick={() => handleClick({ name, directory, size, mimeType, fullPath })}>
            <td className={`icon-row p-1 ${(isPlaying?.name === name || activeImage?.name === name) ? "playing" : ""}`}>
              {directory ? <IconFolder /> : getIcon(name.split(".")[1])}
            </td>
            <td className={(isPlaying?.name === name || activeImage?.name === name) ? "playing" : ""} title={name}>{ truncate(name, 15) }</td>
            <td style={{ minWidth: '60px' }} className={`p-0 ${(isPlaying?.name === name || activeImage?.name === name) ? "playing" : ""}`}><span className="float-end" style={{ fontSize: '0.75rem' }}>{ size }</span></td>
            <td className={`position-absolute mimetype p-0 ${(isPlaying?.name === name || activeImage?.name === name) ? "playing" : ""}`}>{ mimeType ? mimeType : <span style={{ color: 'yellow' }}>unknown</span> }</td>
          </tr>
        ))}
        <tr className="clickable">
          <td></td>
          <td style={{ width: '100%' }}>Mapped a total of {files.length} {files.length === 1 ? "file" : "files"}.</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  )
}

export default FilesViewer