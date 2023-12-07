import { forwardRef, useEffect } from "react";
import { FFIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, StopIcon, RWIcon, MidVolumeIcon, HighVolumeIcon, LowVolumeIcon } from "./Icons";
import { IFile } from "../utils";
import { formatTrackTime, padNum } from "../utils";

type AudioExtProps = {
  wind: Function,
  play: Function,
  pause: Function,
  stop: Function,
  changeSong: Function,
  setElapsed: Function,
  goTo: Function,
  setDuration: Function,
  changeVolume: Function,
  isPlaying: null | File | IFile,
  files: IFile[] | null;
  isPaused: boolean;
  duration: number;
  elapsed: number;
  volume: number;
}

const AudioPlayer :
  React.ForwardRefExoticComponent<AudioExtProps & React.RefAttributes<HTMLAudioElement>>
= forwardRef<HTMLAudioElement, AudioExtProps>((props, ref) => {
  const {
    isPaused, setElapsed, changeSong, files,
    setDuration, isPlaying, pause, stop, wind,
    duration, elapsed, goTo, changeVolume, volume
  } = props;
  useEffect(() => {
    if (ref && "current" in ref && ref.current && !ref.current.paused) {
      setElapsed(() => ref.current?.currentTime)
    }
  }, [])

  // @ts-ignore
  const nxt = () => changeSong(files, isPlaying.name, 1);
  // @ts-ignore
  const prv = () => changeSong(files, isPlaying.name, -1);

  const onLoadedMetadata = () => {
    // @ts-ignore
    const seconds = Math.floor(ref.current.duration);
    setDuration(() => seconds);
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => goTo(parseInt(e.target.value));

  return (
    <>
      <div style={{ visibility: isPlaying ? "visible" : "hidden" }} className="position-absolute music-controls music-controls-actual">
        <div className="flow-play">
          {isPaused ? <span onClick={() => pause()}><PlayIcon /></span> : <span onClick={() => pause()}><PauseIcon /></span>}
          <span onClick={() => stop()}><StopIcon /></span>
        </div>
        <div className="flow-duration">
          <span onClick={() => wind(-5)}><RWIcon /></span>
          <div className="position-relative rangeholder">
            <input
              type="range"
              className="w-100 progress-bar"
              min={0}
              max={duration}
              value={elapsed}
              onChange={seek}
            />
            <span className="position-absolute flow-start-duration">{elapsed < 10 ? `0:${padNum(elapsed)}` : formatTrackTime(elapsed)}</span>
            <span className="position-absolute flow-end-duration">{duration < 10 ? `0:${padNum(duration)}` : formatTrackTime(duration)}</span>
          </div>
          <span onClick={() => wind(5)}><FFIcon /></span>
        </div>
        <div className="flow-switch">
          <span onClick={() => prv()}><PrevIcon /></span>
          <span onClick={() => nxt()}><NextIcon /></span>
        </div>
        <div className="flow-volume position-relative">
          {volume < 0.3 ? <span><LowVolumeIcon /></span> : volume < 0.7 ? <span><MidVolumeIcon /></span> : <span><HighVolumeIcon /></span>}
          <input
            className="volume-bar"
            min={0}
            max={1}
            step={0.01}
            defaultValue={volume}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => changeVolume(e.target.value)}
            type="range"
          />
        </div>
      </div>
      <audio id="audio" onEnded={() => nxt()} onLoadedMetadata={onLoadedMetadata} preload="metadata" className="position-absolute audio-tag music-controls" controls ref={ref} />
    </>
  )
});

export default AudioPlayer