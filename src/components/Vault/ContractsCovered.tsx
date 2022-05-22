import { CHAINID } from "../../settings";
import { isAddress } from "ethers/lib/utils";
import { getChainById, shortenAddress } from "@usedapp/core/dist/esm/src/helpers";

interface IProps {
  contracts: Array<{}>
}

export default function ContractsCovered(props: IProps) {
  const chain = getChainById(CHAINID)

  return (
    <>
      {props.contracts.map((contract: { [key: string]: string; }, index: number) => {
        const contractName = Object.keys(contract)[0];
        const contractVaule = contract?.[contractName];
        const isLink = isAddress(contractVaule) ? false : true;

        return (
          <a key={index} target="_blank" rel="noopener noreferrer" className="contract-wrapper" href={isLink ? contractVaule : chain?.getExplorerAddressLink(contractVaule)}>
            <span title={contractName} className="contract-name">{contractName}</span>
            <span title={contractVaule} className="contract-value">{isLink ? contractVaule : shortenAddress(contractVaule)}</span>
          </a>
        )
      })}
    </>
  )
}
