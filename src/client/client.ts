import { SKIP_API_URL, SkipRouter } from "@skip-router/core";
import { paymentClientOption } from "../types";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

declare let window: WalletWindow;

export const getPaymentClient = (clientOptions?: paymentClientOption) => {
  const paymentClient = () => {
    const skipRouter = getSkipRouter(clientOptions);
    const makePayment = async (
      chainID: string,
      to: string,
      amount: number,
      denom: string
    ) => {
      let resultTxHash;

      const route = await skipRouter.route({
        amountIn: "" + amount,
        sourceAssetChainID: chainID,
        sourceAssetDenom: denom,
        destAssetChainID: chainID,
        destAssetDenom: denom,
        cumulativeAffiliateFeeBPS: "0",
      });

      const addresses: Record<string, string> = {};
      addresses[chainID] = to;

      await skipRouter.executeRoute({
        route,
        userAddresses: addresses,
        onTransactionBroadcast: async (txInfo: {
          txHash: string;
          chainID: string;
        }) => {
          resultTxHash = txInfo.txHash;
          console.log("TxSuccess", resultTxHash);
          clientOptions?.onTxSuccess?.(txInfo.chainID, txInfo.txHash);
        },
      });

      if (!resultTxHash) throw new Error("payment unsuccessful");
      return resultTxHash;
    };

    return { makePayment: makePayment };
  };

  return paymentClient;
};

const getSkipRouter = (clientOptions?: paymentClientOption) => {
  let skipRouter: SkipRouter;
  if (clientOptions?.useMnemonic) {
    skipRouter = new SkipRouter({
      apiURL: SKIP_API_URL,
      getCosmosSigner: async (chainID) => {
        return DirectSecp256k1HdWallet.fromMnemonic(clientOptions.mnemonic);
      },
    });
  } else {
    skipRouter = new SkipRouter({
      apiURL: SKIP_API_URL,
      getCosmosSigner: async (chainID) => {
        try {
          return window.keplr.getOfflineSigner(chainID);
        } catch (err) {
          throw new Error("Keplr wallet is not installed");
        }
      },
    });
  }

  return skipRouter;
};
