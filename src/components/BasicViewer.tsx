import { IFile } from '../utils'
import { IconFolder, IconFile, IconFolderOpen } from './Icons'

type BVProps = {
  files: IFile[],
  onBack: Function,
  onOpen: Function,
}

const BasicViewer = ({ files, onBack, onOpen } : BVProps): JSX.Element => (
  <table className="table">
    <tbody>
      <tr className="clickable" onClick={() => onBack()}>
        <td className="icon-row">
          <IconFolderOpen />
        </td>
        <td>...</td>
        <td></td>
      </tr>

      {files.map(({ name, directory, size }) => {
        return (
          <tr className="clickable" onClick={() => directory && onOpen(name)}>
            <td className="icon-row">
              {directory ? <IconFolder /> : <IconFile />}
            </td>
            <td>{name}</td>
            <td>
              <span className="float-end">{size}</span>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)

export default BasicViewer;