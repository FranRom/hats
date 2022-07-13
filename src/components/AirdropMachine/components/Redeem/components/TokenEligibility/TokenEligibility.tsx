import { useTranslation } from "react-i18next";
import { shortenIfAddress } from "@usedapp/core";
import HatsLogo from "../../../../../../assets/icons/hats-logo-circle.svg";
import RadioButtonChecked from "../../../../../../assets/icons/radio-button-checked.svg";
import RadioButton from "../../../../../../assets/icons/radio-button.svg";
import { AirdropMachineWallet } from "types/types";
import millify from "millify";
import "./index.scss";

interface IProps {
  data: AirdropMachineWallet;
  nextStage: () => void;
}

export default function TokenEligibility({ data, nextStage }: IProps) {
  const { t } = useTranslation();

  const totalHatsEligibility = Object.values(data.token_eligibility).reduce((a, b = 0) => a + b, 0);

  return (
    <div className="token-eligibility-wrapper">
      <span>{t("AirdropMachine.TokenEligibility.text-1")}</span>
      <div className="token-eligibility__total-hats-container">
        <span>{`${shortenIfAddress(data.id)} ${t("AirdropMachine.TokenEligibility.text-2")}`}</span>
        <div className="token-eligibility__total-hats">
          <img src={HatsLogo} alt="hats logo" />
          <span className="token-eligibility__value">{millify(totalHatsEligibility)} HATS</span>
        </div>
      </div>
      <div className="token-eligibility__breakdown-wrapper">

        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <b>{t("AirdropMachine.TokenEligibility.text-3")}</b>
          </div>
          <div className="token-eligibility__breakdown_element-value">
            <u>{t("AirdropMachine.TokenEligibility.text-4")}</u>
          </div>
        </div>

        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <img src={data.token_eligibility.committee_member > 0 ? RadioButtonChecked : RadioButton} alt="radio button" />
            {t("AirdropMachine.TokenEligibility.text-5")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {millify(data.token_eligibility.committee_member)} HATS
          </div>
        </div>

        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <img src={data.token_eligibility.depositor > 0 ? RadioButtonChecked : RadioButton} alt="radio button" />
            {t("AirdropMachine.TokenEligibility.text-6")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {millify(data.token_eligibility.depositor)} HATS
          </div>
        </div>

        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <img src={data.token_eligibility.crow > 0 ? RadioButtonChecked : RadioButton} alt="radio button" />
            {t("AirdropMachine.TokenEligibility.text-7")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {millify(data.token_eligibility.crow)} HATS
          </div>
        </div>

        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <img src={data.token_eligibility.coder > 0 ? RadioButtonChecked : RadioButton} alt="radio button" />
            {t("AirdropMachine.TokenEligibility.text-8")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {millify(data.token_eligibility.coder)} HATS
          </div>
        </div>


        <div className="token-eligibility__breakdown-element">
          <div className="token-eligibility__breakdown_element-name">
            <img src={data.token_eligibility.early_contributor > 0 ? RadioButtonChecked : RadioButton} alt="radio button" />
            {t("AirdropMachine.TokenEligibility.text-9")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {data.token_eligibility.early_contributor} HATS
          </div>
        </div>


        <div className="token-eligibility__breakdown-element total">
          <div className="token-eligibility__breakdown_element-name">
            {t("AirdropMachine.TokenEligibility.text-10")}
          </div>
          <div className="token-eligibility__breakdown_element-value">
            {millify(totalHatsEligibility)} HATS
          </div>
        </div>

      </div>

      <section>
        <span className="token-eligibility__section-title">{t("AirdropMachine.TokenEligibility.text-11")}</span>
        <span>{t("AirdropMachine.TokenEligibility.text-12")}</span>
      </section>

      <section>
        <span className="token-eligibility__section-title">{t("AirdropMachine.TokenEligibility.text-13")}</span>
        <span>{t("AirdropMachine.TokenEligibility.text-14")}</span>
      </section>

      <button className="fill" onClick={nextStage}>{t("AirdropMachine.TokenEligibility.button-text")}</button>
    </div>
  )
}