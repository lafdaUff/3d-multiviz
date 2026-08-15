import { useTranslation } from "react-i18next";

export default function ResetRotationButton({ onClick }: { onClick?: () => void }) {
    const { t } = useTranslation();

    return (
        <div className="reset-rotation-wrapper">
            <button className="reset-rotation" id="reset-rotation-btn" onClick={onClick}>
                <i className="fa-solid fa-rotate-left"></i>
                {t("viewport.resetRotation")}
            </button>
        </div>
    );
}
