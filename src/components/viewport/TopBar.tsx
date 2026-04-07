import i18n from "../../i18n";
import ModeSelector from "./ModeSelector";
import { useTranslation } from "react-i18next";
import { useDataFile } from "../../dev/useDataManager";

interface CollectionConfig {
  nome?: string;
  autoria?: string;
}

interface TopBarProps {
  toggleInfoScreen?: () => void;
  toggleLock: () => void;
  isCameraLocked?: boolean;
}

export default function TopBar({toggleInfoScreen, toggleLock, isCameraLocked} : TopBarProps) {

  function handleFullscreen() {
    const viewport = document.getElementById('viewport');
    if (viewport) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        viewport.requestFullscreen();
      }
    }
  }
  function toggleLanguage() {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  }

  const { t } = useTranslation();
  const { data: config } = useDataFile<CollectionConfig>('collectionconfig');

  return (
    <div className="viewportTop flex">
      <div className="viewportTitle">
            <h5 id="objectName">{config?.nome || t("collection.name")}</h5>
            <p id="objectDesc">{config?.autoria || t("collection.desc")}</p>
      </div>
      <div className="viewportInteraction flex">
        <p id="lock-btn" className="viewportBtn" onClick={toggleLanguage}>
            <strong>{i18n.language === 'pt' ? 'PT' : 'EN'}</strong>
        </p>
        <ModeSelector />
        <p id="help-mode-btn" className="viewportBtn" onClick={toggleInfoScreen}>
            <i className="fa-regular fa-circle-question"></i>
        </p>
        <p className="viewportBtn">
            <i id="fullscreenBtn" className="fa-solid fa-up-right-and-down-left-from-center" onClick={handleFullscreen}></i>
        </p>
      </div>
    </div>
  );
}
