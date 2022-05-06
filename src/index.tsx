import ReactDOM from "react-dom";
import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { Provider } from "react-redux";
import store from "./store/index";
import App from "./App";
import { LP_UNISWAP_URI, CHAINID, SUBGRAPH_URI, ENDPOINT } from "./settings";
import HttpsRedirect from "react-https-redirect";
import { LP_UNISWAP_V3_HAT_ETH_APOLLO_CONTEXT } from "./constants/constants";
import { ChainId, Config, DAppProvider } from "@usedapp/core";
import { BrowserRouter } from "react-router-dom";
import { getDefaultProvider } from "@ethersproject/providers";
import { getChainById } from "@usedapp/core/dist/esm/src/helpers";
import NotificationProvider from "components/Notifications/NotificationProvider";
import "./index.css";

const main_subgraph = new HttpLink({
  uri: SUBGRAPH_URI
});

const lp_uniswap_subgraph = new HttpLink({
  uri: LP_UNISWAP_URI
});

const apolloLink = ApolloLink.split(operation => operation.getContext().clientName === LP_UNISWAP_V3_HAT_ETH_APOLLO_CONTEXT, lp_uniswap_subgraph, main_subgraph);

console.log(`Using ${ChainId[CHAINID]} network`);

let config: Config = {
  networks: [getChainById(CHAINID)!],
  readOnlyChainId: CHAINID,
  readOnlyUrls: {
    [CHAINID]: ENDPOINT || getDefaultProvider(CHAINID)
  },
  autoConnect: true
}
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: apolloLink
})

ReactDOM.render(
  <DAppProvider config={config}>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <HttpsRedirect>
          <BrowserRouter>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </BrowserRouter>
        </HttpsRedirect>
      </ApolloProvider>
    </Provider>
  </DAppProvider>,
  document.getElementById("root")
);
