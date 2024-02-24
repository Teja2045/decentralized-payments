import { SigningStargateClient } from "@cosmjs/stargate";
import { paymentClientOption } from "../types";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

declare let window: WalletWindow;

export const getPaymentClient = (clientOptions?: paymentClientOption) => {
  const paymentClient = () => {
    const signer = getSigner(clientOptions);
    const makePayment = async (
      chainID: string,
      from: string,
      to: string,
      amount: number,
      denom: string
    ) => {
      let resultTxHash;

      const address = (await signer.getAccounts())[0].address;

      const signingClient = await SigningStargateClient.connectWithSigner(
        "https://rpc.mainnet.desmos.network",
        signer
      );
      
      console.log(
        "With signing client, chain id:",
        await signingClient.getChainId(),
        ", height:",
        await signingClient.getHeight()
      );

      const result = await signingClient.sendTokens(
        from,
        to,
        [{ denom: denom, amount: "" + amount }],
        "auto"
      );

      resultTxHash = result.transactionHash;

      result.code === 0 && clientOptions?.onTxSuccess?.(chainID, resultTxHash);

      if (!resultTxHash || result.code !== 0)
        throw new Error("payment unsuccessful");
      return resultTxHash;
    };

    return { makePayment: makePayment };
  };

  return paymentClient;
};

const getSigner = (clientOptions?: paymentClientOption) => {
  let signer;
  if (clientOptions?.useMnemonic) {
    signer = DirectSecp256k1HdWallet.fromMnemonic(clientOptions.mnemonic);
  } else {
    signer = window.keplr;
  }

  if (!signer) throw new Error("kepler wallet is not installed..");

  return signer;
};
