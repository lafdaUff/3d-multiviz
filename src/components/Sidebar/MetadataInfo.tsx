import {type ModelData} from '../viewport/Experience';
import MetadataItem from './MedadataItem';

interface MetadataInfoProps {
  objectData: ModelData;
  onFilter?: (key: string, value: string) => void;
}

export default function MetadataInfo({ objectData, onFilter }: MetadataInfoProps) {

  return (
    <div className="metadata-div">
        <h5 className="bold">{objectData.nome}</h5>
      <ul id="objetos" className="objetos">
        <small className='metadata-item description'>{objectData.descricao}</small>
        {objectData.customdata && objectData.customdata.map((metadataEntry, index) => (
            <MetadataItem key={index} metadataEntry={metadataEntry} onFilter={onFilter} />
        ))}
      </ul>
    </div>
  );
}
