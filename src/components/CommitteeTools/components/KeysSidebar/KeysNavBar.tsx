import classNames from "classnames";
import { NavLink } from "react-router-dom";
import { RoutePaths } from "../../../../constants/constants";
import { IStoredKey } from "../../../../types/types";
import LockIcon from '../../../../assets/icons/lock.icon';
import "./index.scss";

interface IProps {
  keys: IStoredKey[]
  selected?: string
}

export default function KeysSidebar({ keys }: IProps) {
  return (
    <div className={classNames({ 'keys-navbar': true })}>
      {
        keys && keys.map((storedKey) =>
          <NavLink
            key={storedKey.alias}
            className="nav-link"
            to={`${RoutePaths.committee_tools}/${storedKey.alias}`}
            activeClassName="selected"
          ><LockIcon />{storedKey.alias}</NavLink>
        )
      }
      <NavLink
        exact
        className="nav-link"
        activeClassName="selected"
        to={`${RoutePaths.committee_tools}`}>new</NavLink>
    </div>
  )
}
