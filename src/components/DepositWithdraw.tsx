import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWalletBalance, fromWei, getNetworkNameByChainId, getTokenPrice, isDigitsOnly, numberWithCommas } from "../utils";
import Loading from "./Shared/Loading";
import InfoIcon from "../assets/icons/info.icon";
import "../styles/DepositWithdraw.scss";
import * as contractsActions from "../actions/contractsActions";
import { IVault } from "../types/types";
import { getStakerAmountByVaultID } from "../graphql/subgraph";
import { useQuery } from "@apollo/react-hooks";
import { BigNumber } from "@ethersproject/bignumber";
import { RootState } from "../reducers";
import Logo from "../assets/icons/logo.icon";
import Tooltip from "rc-tooltip";
import { RC_TOOLTIP_OVERLAY_INNER_STYLE } from "../constants/constants";
import millify from "millify";
import classNames from "classnames";
import { DATA_POLLING_INTERVAL } from "../settings";
import { toggleInTransaction } from "../actions";

interface IProps {
  data: IVault
}

export default function DepositWithdraw(props: IProps) {
  const dispatch = useDispatch();
  const { id, pid, master, stakingToken, name, apy } = props.data;
  const [isDeposit, setIsDeposit] = useState(true);
  const [userInput, setUserInput] = useState("0");
  const [isApproved, setIsApproved] = useState(false);
  const inTransaction = useSelector((state: RootState) => state.layoutReducer.inTransaction);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const notEnoughBalance = parseInt(userInput) > parseInt(tokenBalance);
  const selectedAddress = useSelector((state: RootState) => state.web3Reducer.provider?.selectedAddress) ?? "";
  const rewardsToken = useSelector((state: RootState) => state.dataReducer.rewardsToken);
  const hatsPrice = useSelector((state: RootState) => state.dataReducer.hatsPrice);
  const chainId = useSelector((state: RootState) => state.web3Reducer.provider?.chainId) ?? "";
  const network = getNetworkNameByChainId(chainId);
  const { loading, error, data } = useQuery(getStakerAmountByVaultID(id, selectedAddress), { pollInterval: DATA_POLLING_INTERVAL });

  const stakedAmount: BigNumber = useMemo(() => {
    if (!loading && !error && data && data.stakers) {
      return data.stakers[0]?.amount ?? BigNumber.from(0);
    }
    return BigNumber.from(0);
  }, [loading, error, data])

  const canWithdraw = stakedAmount && Number(fromWei(stakedAmount)) >= Number(userInput);
  const percentageValue = isDeposit ? tokenBalance : fromWei(stakedAmount);

  React.useEffect(() => {
    const checkIsApproved = async () => {
      setIsApproved(await contractsActions.isApproved(stakingToken, selectedAddress, master.address));
    }
    checkIsApproved();
  }, [stakingToken, selectedAddress, master.address]);

  React.useEffect(() => {
    const getTokenData = async () => {
      setTokenBalance(await contractsActions.getTokenBalance(stakingToken, selectedAddress));
      setTokenSymbol(await contractsActions.getTokenSymbol(stakingToken));
    }
    getTokenData();
  }, [stakingToken, selectedAddress, inTransaction]);

  const [pendingReward, setPendingReward] = useState(BigNumber.from(0));

  React.useEffect(() => {
    const getPendingReward = async () => {
      setPendingReward(await contractsActions.getPendingReward(master.address, pid, selectedAddress));
    }
    getPendingReward();
  }, [master.address, selectedAddress, pid, inTransaction])

  const [poolToken, setPoolToken] = useState(0);

  React.useEffect(() => {
    const getPoolToken = async () => {
      // TODO: Should be staking token - e.g. vault.stakingToken
      setPoolToken(await getTokenPrice("0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf"));
    }
    getPoolToken();
  }, []);

  const yearlyEarnings = React.useMemo(() => {
    if (apy && poolToken && hatsPrice) {
      return apy * Number(fromWei(stakedAmount)) * poolToken;
    }
    return 0;
  }, [apy, poolToken, hatsPrice, stakedAmount])

  const approveToken = async () => {
    dispatch(toggleInTransaction(true));
    await contractsActions.createTransaction(
      async () => contractsActions.approveToken(stakingToken, master.address),
      async () => {
        setIsApproved(true);
      },
      () => { }, dispatch, `Spending ${tokenSymbol} approved`);
    dispatch(toggleInTransaction(false));
  }

  const depositAndClaim = async () => {
    dispatch(toggleInTransaction(true));
    await contractsActions.createTransaction(
      async () => contractsActions.depositAndClaim(pid, master.address, userInput),
      async () => {
        setUserInput("0");
        fetchWalletBalance(dispatch, network, selectedAddress, rewardsToken);
      }, () => { }, dispatch, `Deposited ${userInput} ${tokenSymbol} and Claimed ${millify(Number(fromWei(pendingReward)))} HATS`);
    dispatch(toggleInTransaction(false));
  }

  const withdrawAndClaim = async () => {
    dispatch(toggleInTransaction(true));
    await contractsActions.createTransaction(
      async () => contractsActions.withdrawAndClaim(pid, master.address, userInput),
      async () => {
        setUserInput("0");
        fetchWalletBalance(dispatch, network, selectedAddress, rewardsToken);
      }, () => { }, dispatch, `Withdrawn ${userInput} ${tokenSymbol} and Claimed ${millify(Number(fromWei(pendingReward)))} HATS`);
    dispatch(toggleInTransaction(false));
  }

  const claim = async () => {
    dispatch(toggleInTransaction(true));
    await contractsActions.createTransaction(
      async () => contractsActions.claim(pid, master.address),
      async () => {
        setUserInput("0");
        fetchWalletBalance(dispatch, network, selectedAddress, rewardsToken);
      }, () => { }, dispatch, `Claimed ${millify(Number(fromWei(pendingReward)))} HATS`);
    dispatch(toggleInTransaction(false));
  }

  const depositWithdrawWrapperClass = classNames({
    "deposit-wrapper": true,
    "in-withdraw": !isDeposit,
    "disabled": inTransaction
  })

  return <div className={depositWithdrawWrapperClass}>
    <div className="tabs-wrapper">
      <button className="tab deposit" onClick={() => { setIsDeposit(true); setUserInput("0"); }}>DEPOSIT</button>
      <button className="tab withdraw" onClick={() => { setIsDeposit(false); setUserInput("0"); }}>WITHDRAW</button>
    </div>
    <div className="balance-wrapper">
      {!tokenBalance ? <div style={{ position: "relative", minWidth: "50px" }}><Loading /></div> : <span>{`${tokenSymbol} Balance: ${numberWithCommas(Number(tokenBalance))}`}</span>}
    </div>
    <div>
      <div className={!isApproved ? "amount-wrapper disabled" : "amount-wrapper"}>
        <div className="top">
          <span>Pool token</span>
          <span>&#8776; {!poolToken ? "-" : `$${millify(poolToken)}`}</span>
        </div>
        <div className="input-wrapper">
          <div className="pool-token"><Logo width="30" /> <span>{name}</span></div>
          <input type="number" value={userInput} onChange={(e) => { isDigitsOnly(e.target.value) && setUserInput(e.target.value) }} min="0" />
        </div>
        {isDeposit && notEnoughBalance && <span className="input-error">Insufficient funds</span>}
        {!isDeposit && !canWithdraw && <span className="input-error">Can't withdraw more than staked</span>}
      </div>
    </div>
    <div>
      <button disabled={!isApproved} className="percentage-btn" onClick={() => setUserInput(String((25 / 100) * parseInt(percentageValue)))}>25%</button>
      <button disabled={!isApproved} className="percentage-btn" onClick={() => setUserInput(String((50 / 100) * parseInt(percentageValue)))}>50%</button>
      <button disabled={!isApproved} className="percentage-btn" onClick={() => setUserInput(String((75 / 100) * parseInt(percentageValue)))}>75%</button>
      <button disabled={!isApproved} className="percentage-btn" onClick={() => setUserInput(percentageValue)}>100%</button>
    </div>
    <div className="staked-wrapper">
      <span>You staked</span>
      <div style={{ position: "relative" }}>{loading ? <Loading /> : <span>{numberWithCommas(Number(fromWei(stakedAmount)))}</span>}</div>
    </div>
    <div className="earnings-wrapper">
      <span>Monthly earnings &nbsp;
        <Tooltip
          overlay="Estimated monthly earnings based on total staked amount and rate reward"
          overlayClassName="tooltip"
          overlayInnerStyle={RC_TOOLTIP_OVERLAY_INNER_STYLE}
          placement="top">
          <span><InfoIcon /></span>
        </Tooltip>
      </span>
      <span>{`${millify(yearlyEarnings / 12)}`} Hats</span>
      <span>&#8776; {`$${millify((yearlyEarnings / 12) * hatsPrice)}`}</span>
    </div>
    <div className="earnings-wrapper">
      <span>Yearly earnings &nbsp;
        <Tooltip
          overlay="Estimated yearly earnings based on total staked amount and rate reward"
          overlayClassName="tooltip"
          overlayInnerStyle={RC_TOOLTIP_OVERLAY_INNER_STYLE}
          placement="top">
          <span><InfoIcon /></span>
        </Tooltip>
      </span>
      <span>{`${millify(yearlyEarnings)}`} Hats</span>
      <span>&#8776; {`$${millify(yearlyEarnings * hatsPrice)}`}</span>
    </div>
    <div className="action-btn-wrapper">
      {!isApproved && <button
        className="action-btn"
        onClick={async () => await approveToken()}>{`ENABLE SPENDING ${tokenSymbol}`}</button>}
      {isApproved && isDeposit && <button
        disabled={notEnoughBalance || !userInput || userInput === "0"}
        className="action-btn"
        onClick={async () => await depositAndClaim()}>DEPOSIT AND CLAIM</button>}
      {isApproved && !isDeposit && <button
        disabled={!canWithdraw || !userInput || userInput === "0"}
        className="action-btn"
        onClick={async () => await withdrawAndClaim()}>WITHDRAW AND CLAIM</button>}
    </div>
    <div className="alt-actions-wrapper">
      <button onClick={async () => await claim()} disabled={!isApproved || pendingReward.eq(0)} className="alt-action-btn">{`CLAIM ${millify(Number(fromWei(pendingReward)))} HATS`}</button>
    </div>
    {inTransaction && <Loading />}
  </div>
}