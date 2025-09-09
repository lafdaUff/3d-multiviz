import i18n from "../../i18n";
import ModeSelector from "./ModeSelector";
import { useTranslation } from "react-i18next";

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
  
  return (
    <div className="viewportTop flex">
      <div>
            <h5 id="objectName">{t("collection.name")}</h5>
            <p id="objectDesc">{t("collection.desc")}</p>
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
