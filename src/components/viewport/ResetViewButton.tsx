import { useTranslation } from "react-i18next";

export default function ResetViewButton({ onClick }: { onClick?: () => void }) {
    const { t } = useTranslation();

    return (
        <div className="reset-view-wrapper">
            <button className="reset-view" id="reset-view-btn" onClick={onClick}>
                <i className="fa-solid fa-rotate-left"></i>
                {t("viewport.resetView")}
            </button>
        </div>
    );
}
