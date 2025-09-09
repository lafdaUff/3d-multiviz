import { useTranslation } from "react-i18next";

export default function InfoScreen({toggleInfoScreen} : {toggleInfoScreen?: () => void}) {
  const { t } = useTranslation();

  return (
    <div className="helpMode overlay flex" id="help-mode">
        <h3>{t("tutorial.title")}</h3>
        <div className="flex navHelpItems">
            <div className="navHelpItem">
                <i className="fa-solid fa-arrows-spin"></i>
                <p><span>{t("tutorial.step1.label")}</span></p>
                <p>{t("tutorial.step1.description")}</p>
            </div>
            <div className="navHelpItem">
                <i className="fa-solid fa-magnifying-glass-plus"></i>
                <p><span>{t("tutorial.step2.label")}</span></p>
                <p>{t("tutorial.step2.description")}</p>
            </div>
            <div className="navHelpItem">
                <i className="fa-solid fa-up-down-left-right"></i>
                <p><span>{t("tutorial.step3.label")}</span></p>
                <p>{t("tutorial.step3.description")}</p>
            </div>
            <div className="navHelpItem">
                <i className="fa-solid fa-hand-pointer"></i>
                <p><span>{t("tutorial.step4.label")}</span></p>
                <p>{t("tutorial.step4.description")}</p>
            </div>
        </div>
        <button className="inverted" id="navigate-btn" onClick={toggleInfoScreen}>{t("tutorial.navigate")}</button>
        <div>
            <p className="infoText">{t("tutorial.moreInfo")} <a href="https://lafda.uff.br">{t("tutorial.lafdaSite")}</a>.</p>
        </div>
    </div>
  );
}
