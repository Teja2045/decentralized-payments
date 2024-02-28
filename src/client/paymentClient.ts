import { SigningStargateClient } from "@cosmjs/stargate";
import { PaymentClientOption, PaymentRequest } from "../types";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  ERR_CHAIN_NOT_SUPPORTED,
  ERR_WALLET_NOT_INSTALLED,
} from "../utils/errors";
let networks = require("../resources/networks.json");

declare let window: WalletWindow;

/* check if the we are supporting the given chain */
const isChainSupported = (chainID: string) => {
  return !!networks[chainID];
};

/*
  either build a wallet for signing from mnemonic or
  use keplr offlineSigner  
*/
export const getPaymentClient = async (
  chainID: string,
  clientOptions?: PaymentClientOption
) => {
  /*
    Todo: add support for more chains
  */
  if (!isChainSupported(chainID))
    throw new Error(chainID + " " + ERR_CHAIN_NOT_SUPPORTED);

  const chainInfo = networks[chainID];

  /* signers to sign the transactions */
  const signer = await getSigner(chainID, clientOptions);

  /* callback to make the payments */
  const makePayment = async (paymentRequest: PaymentRequest) => {
    let resultTxHash;

    const signingClient = await SigningStargateClient.connectWithSigner(
      chainInfo.rpc,
      signer
    );

    const { from, to, denom, amount, memo } = paymentRequest;

    /* send transaction */
    const result = await signingClient.sendTokens(
      from,
      to,
      [{ denom: denom, amount: "" + amount }],

      /* 
        constant gas for now
        Todo: make it dynamic 
      */
      {
        amount: [{ denom: denom, amount: "5000" }],
        gas: "200000",
      },
      memo
    );

    console.log("result", result);

    resultTxHash = result.transactionHash;

    /*
      if the payment is successful, invoke the callback (eg: hit the server endpoint to confirm the payment)
    */
    result.code === 0 && clientOptions?.onTxSuccess?.(chainID, resultTxHash);

    if (!resultTxHash || result.code !== 0)
      throw new Error("payment unsuccessful");

    return resultTxHash;
  };

  return { makePayment: makePayment };
};

const getSigner = async (
  chainID: string,
  clientOptions?: PaymentClientOption
) => {
  let signer;
  if (clientOptions?.useMnemonic) {
    signer = await DirectSecp256k1HdWallet.fromMnemonic(
      clientOptions.mnemonic,
      { prefix: networks[chainID].prefix }
    );
  } else {
    signer = window.keplr?.getOfflineSigner(chainID);
  }

  if (!signer) throw new Error(ERR_WALLET_NOT_INSTALLED);

  return signer;
};
