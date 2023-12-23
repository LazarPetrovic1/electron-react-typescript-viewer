import { useEffect, useMemo, useRef, useState } from "react";
import { FFT_SIZE, FileType as AcceptedFileType, circleVisualiser, getFiles, getMediaByType, getBase64Image, filter, isFileOfType, getAllFilesOfType } from "../utils";
import { IFile } from "../utils";
import { Animation, AudioPlayer, FilesViewer } from "../components";
import { DocumentIcon, IconFolder, ImageIcon, MediaIcon, Mp3Icon, Mp4Icon, SrcCodeIcon } from "../components/Icons";

let audioSource : MediaElementAudioSourceNode;
let analyser : AnalyserNode;
let x = 0;
let barHeight: number;
const pathModule = window.require('path');

function Main(): JSX.Element {
  const audio = useRef<null | HTMLAudioElement>(null);
  const [musicData, setMusicData] = useState<Uint8Array | null>(null);
  const [bufferLength, setBufferLength] = useState<number | null>(null);
  const [allFiles, setAllFiles] = useState<null | FileList | File[]>(null);
  const [isPlaying, setIsPlaying] = useState<null | File | IFile>(null);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [elapsed, setElapsed] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(() => true);
  const [currentFileType, setCurrentFileType] = useState<AcceptedFileType | "directory" | "*" | 'all'>("*");
  const [showImgControls, setShowImgControls] = useState<boolean>(() => false);
  const [activeImage, setActiveImage] = useState<null | IFile>(null);

  const [path, setPath] = useState<string>("");
  const files : IFile[] = useMemo(() => path ? getFiles(path) : [], [path]);
  const [mediaFiles, setMediaFiles] = useState<IFile[]>(() => files);
  const [mode, setMode] = useState<"filter" | 'media'>('filter')
  const switchMode = () => setMode((pm) => pm === 'filter' ? 'media' : 'filter');
  
  const [searchString, setSearchString] = useState<string>(() => '');
  
  const onBack = () : void => setPath(() => pathModule.dirname(path));
  const onOpen = (folder : string) : void => { setPath(() => pathModule.join(path, folder)); setSearchString(() => ''); }
  
  const filteredFiles : IFile[] = files.filter((s: IFile) : boolean => searchString.length === 0 ? true : s.name.includes(searchString));

  useEffect(() => {
    if (files.length !== mediaFiles.length) setMediaFiles(() => files);
    // eslint-disable-next-line
  }, [files]);

  const getFileOfType = (type: AcceptedFileType | "directory" | "*" | 'all') : void | IFile[] => {
    setCurrentFileType(() => type);
    let newFiles : IFile[] = [];
    if (type === 'audio' || type === 'video' || type === 'image' || type === 'document' || type === 'code') {
      newFiles = files.filter((s: IFile) : boolean => !!s.mimeType?.includes(type))
      setMediaFiles(() => files.filter((s: IFile) : boolean => !!s.mimeType?.includes(type)))
    }
    if (type === 'directory') {
      newFiles = files.filter((s: IFile) : boolean => s.directory);
      setMediaFiles(() => files.filter((s: IFile) : boolean => s.directory))
    }
    if (type === '*' || type === 'all') {
      newFiles = files;
      setMediaFiles(() => files);
    }
    return newFiles;
  }

  const searchFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchString(() => value);
    const actualFiles = getAllFilesOfType(files, currentFileType) as IFile[];
    if (value.length < 1) setMediaFiles(() => actualFiles);
    setMediaFiles((pmf) => pmf.filter((pf: IFile) : boolean => (
      !!pf.name.toLowerCase().includes(value.toLowerCase())
    )))
  }

  const changeVolume = (val: string) : void => {
    const newVol = parseFloat(val);
    const audioMain : HTMLAudioElement | null = document.getElementById('audio') as HTMLAudioElement;
    if (audioMain) { audioMain.volume = newVol; setVolume(newVol); }
  };

  useEffect(() => {
    function trackTime() : void {
      if (audio && audio.current && audio.current.currentTime && audio.current.duration) {
        setElapsed(() => audio.current?.currentTime ? Math.ceil(audio.current?.currentTime) : 0);
      }
    }
    const timeoutId = setInterval(trackTime, 250);
    return () => { clearInterval(timeoutId); }
    // eslint-disable-next-line
  }, [audio, audio.current, audio?.current?.currentTime]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) : void => {
    // @ts-ignore
    const path = pathModule.join(e.target.files[0].path, '..');
    if (path && e.target.files) {
      setPath(() => path);
      setAllFiles(() => getMediaByType(e.target.files, "audio"));
    }
  }

  function play(name: string) {
    const cel : HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement;
    if (cel && cel?.style.filter !== filter) cel.style.filter = filter;
    if (allFiles && Array.isArray(allFiles)) {
      const file = allFiles.find((medium: File) => medium.name.toLowerCase() === name.toLowerCase());
      if (file?.name !== isPlaying?.name) {
        if (audio.current && file) {
          audio.current.src = URL.createObjectURL(file as Blob);
          audio.current.preload = 'metadata';
          const audioCtx = new AudioContext();
          audio.current.load();
          audio.current.play();
          setIsPaused(() => false);
          const { volume } = audio.current;
          setVolume(() => volume);
          if (!audioSource) {
            audioSource = audioCtx.createMediaElementSource(audio.current);
            analyser = audioCtx.createAnalyser();
            audioSource.connect(analyser);
            analyser.connect(audioCtx.destination);
          }
          analyser.fftSize = FFT_SIZE;
          const bufferLength = analyser.frequencyBinCount;
          setBufferLength(() => bufferLength);
          const dataArray = new Uint8Array(bufferLength);
          setMusicData(() => dataArray);
        }
      }
    }
  }

  const drawImage = (src: string, mimeType: string) => {
    const activeImageIndex = mediaFiles.map(mf => mf.fullPath).indexOf(src);
    const img : HTMLImageElement | null = document.getElementById('display-image') as HTMLImageElement;
    setShowImgControls(() => true);
    setActiveImage(() => mediaFiles[activeImageIndex]);
    const data = `data:${mimeType};base64,${getBase64Image(src)}`
    img.src = data;
  }

  const handlePausing = () : void => {
    if (isPlaying && audio.current?.paused && audio.current?.currentTime) {
      // @ts-ignore
      audio.current.play(audio.current?.currentTime)
      setIsPaused(() => false);
    } else {
      audio.current?.pause();
      setIsPaused(() => true);
    }
  }
  
  const goTo = (val: number) => audio && audio.current && audio.current.currentTime && (audio.current.currentTime = val);
  const wind = (val: number) => audio && audio.current && audio.current.currentTime && (audio.current.currentTime += val);
  // @ts-ignore
  const stop = () => { audio.current?.pause(); audio.current.currentTime = 0; }

  const changeSong = (files: IFile[], name: string, value: -1 | 1) => {
    const fmap = files.map(f => f.name);
    const itemIndex = fmap.indexOf(name);
    if (value < 1 && itemIndex === 0) {
      play(files[files.length - 1].name);
      setIsPlaying(() => files[files.length - 1])
    }
    if (value > 1 && itemIndex === files.length - 1) {
      play(files[0].name);
      setIsPlaying(() => files[0])
    }
    else {
      play(files[itemIndex + value].name);
      setIsPlaying(files[itemIndex + value]);
    }
  }

  const changeImage = (name: string, value: -1 | 1) : undefined | void => {
    const fmap = mediaFiles.map(f => f.name);
    const itemIndex = fmap.indexOf(name);
    const actualNewIndex = value < 1 && itemIndex === 0 ? mediaFiles.length - 1 :
      value > 1 && itemIndex === mediaFiles.length - 1 ? 0 : itemIndex + value;
    const item = mediaFiles[actualNewIndex];
    if (!isFileOfType(item, 'image')) return;
    drawImage(mediaFiles[actualNewIndex].fullPath, mediaFiles[actualNewIndex].mimeType as string);
  }

  return (
    <div className="d-flex justify-space-between h-100">
      <div>
        <h4 className="text-center m-0">{path}</h4>
        {files.length > 0 && (
          <>
            <div className="d-flex my-2" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                value={searchString}
                onChange={searchFiles}
                className="form-control form-control-sm"
                placeholder="File search"
              />
            </div>
            <div className="d-flex justify-content-between mwside">
              <button onClick={() => getFileOfType("directory")} className={`btn btn-${currentFileType === "directory" ? "secondary" : "primary"} px-2 py-1`} title="List directories"><IconFolder/></button>
              <button onClick={() => getFileOfType("document")} className={`btn btn-${currentFileType === "document" ? "secondary" : "primary"} px-2 py-1`} title="List documents"><DocumentIcon/></button>
              <button onClick={() => getFileOfType("image")} className={`btn btn-${currentFileType === "image" ? "secondary" : "primary"} px-2 py-1`} title="List images"><ImageIcon/></button>
              <button onClick={() => getFileOfType("video")} className={`btn btn-${currentFileType === "video" ? "secondary" : "primary"} px-2 py-1`} title="List videos"><Mp4Icon/></button>
              <button onClick={() => getFileOfType("audio")} className={`btn btn-${currentFileType === "audio" ? "secondary" : "primary"} px-2 py-1`} title="List audio files"><Mp3Icon/></button>
              <button onClick={() => getFileOfType("code")} className={`btn btn-${currentFileType === "code" ? "secondary" : "primary"} px-2 py-1`} title="List source code files"><SrcCodeIcon/></button>
              <button onClick={() => getFileOfType("*")} className="btn btn-primary texthandler px-2" title="Get everything">*</button>
            </div>
          </>
        )}
        <div style={{ overflowY: 'auto', overflowX: 'hidden', width: '300px', borderRight: '1px solid white', height: 'calc(100% - 76px)' }}>
          {files.length <= 0 ? (
            <div>
              <h5 className="text-center my-2">Upload a directory. You can then browse the files, view images and play music.</h5>
              <div className="d-flex justify-content-center">
                {/* @ts-ignore */}
                <input directory="" webkitdirectory="" onChange={handleUpload} multiple accept="directory" style={{ visibility: 'hidden', display: 'none' }} type="file" name="file" id="file" />
                <label style={{ border: "1px solid white", borderRadius: "0.5rem" }} className="btn text-white" htmlFor="file">Upload</label>
              </div>
            </div>
          ) : (
            <>
              <div>
                {/* @ts-ignore */}
                <input directory="" webkitdirectory="" onChange={handleUpload} multiple accept="directory" style={{ visibility: 'hidden', display: 'none' }} type="file" name="file2" id="file2" />
                <label style={{ border: "1px solid white", borderRadius: "0.5rem" }} className="d-block btn button-primary text-white" htmlFor="file2">Change directory</label>
              </div>
              <FilesViewer activeImage={activeImage} drawImage={drawImage} isUl setIsPlaying={setIsPlaying} isPlaying={isPlaying} pause={handlePausing} play={play} allFiles={allFiles} files={mediaFiles} onOpen={onOpen} onBack={onBack} size="300px" />
            </>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }} className="controlholder">
        <Animation activeImage={activeImage} changeImage={changeImage} showImgControls={showImgControls} currentFileType={currentFileType} barHeight={barHeight} bufferLength={bufferLength} animation={circleVisualiser} analyser={analyser} x={x} dataArray={musicData} />
        <AudioPlayer volume={volume} changeVolume={changeVolume} goTo={goTo} setDuration={setDuration} isPaused={isPaused} setElapsed={setElapsed} elapsed={elapsed} duration={duration} changeSong={changeSong} isPlaying={isPlaying} files={mediaFiles} stop={stop} wind={wind} play={play} pause={handlePausing} ref={audio}></AudioPlayer>
      </div>
    </div>
  )
}

export default Main;