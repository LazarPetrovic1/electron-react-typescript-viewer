import { useMemo, useState } from "react";
import { IFile } from "../utils";
import { getFiles } from "../utils";
import { BasicViewer } from "../components";

const pathModule = window.require('path');
const { app } = window.require('@electron/remote');

function Files(): JSX.Element {
  const [path, setPath] = useState<string>(() => app.getAppPath());
  const files = useMemo(() => getFiles(path), [path]);
  const [searchString, setSearchString] = useState<string>(() => '');
  const onBack = () : void => setPath(() => pathModule.dirname(path));
  const onOpen = (folder : string) : void => { setPath(() => pathModule.join(path, folder)); setSearchString(() => ''); }
  const filteredFiles : IFile[] = files.filter((s: IFile) : boolean => s.name.includes(searchString));
  return (
    <div className="container mt-2">
      <h4>{path}</h4>
      <div className="form-group mt-4 mb-2">
        <input
          type="text"
          value={searchString}
          onChange={(e) => setSearchString(() => e.target.value)}
          className="form-control form-control-sm"
          placeholder="File search"
        />
      </div>
      <BasicViewer files={filteredFiles} onBack={onBack} onOpen={onOpen} />
    </div>
  )
}

export default Files