import { CONNECT, UPDATE_SELECTED_ADDRESS, UPDATE_WALLET_BALANCE } from "../constants/action-types";

const initialState = {
  provider: null,
  ethBalance: null,
  hatsBalance: null
};

export const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case CONNECT: {
      return {
        ...state,
        provider: action.provider
      }
    }
    case UPDATE_SELECTED_ADDRESS: {
      return {
        ...state,
        provider: {
          ...state.provider,
          selectedAddress: action.selectedAddress
        }
      }
    }
    case UPDATE_WALLET_BALANCE: {
      return {
        ...state,
        ethBalance: action.ethBalance,
        hatsBalance: action.hatsBalance
      }
    }
    default:
        return state;
  }
};