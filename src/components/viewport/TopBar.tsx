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
  
  return (
    <div className="viewportTop flex">
        <p id="lock-btn" className="viewportBtn" onClick={toggleLock}>
            <i className={`fa-solid fa-lock${isCameraLocked ? '-open' : ''}`}></i>
        </p>
        <p id="help-mode-btn" className="viewportBtn" onClick={toggleInfoScreen}>
            <i className="fa-regular fa-circle-question"></i>
        </p>
        <p className="viewportBtn">
            <i id="fullscreenBtn" className="fa-solid fa-up-right-and-down-left-from-center" onClick={handleFullscreen}></i>
        </p>
    </div>
  );
}
