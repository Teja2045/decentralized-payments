import { isValidTxParams } from "../types";
import {
  ERR_CHAIN_NOT_SUPPORTED,
  ERR_INVALID_TRANSACTION,
} from "../utils/errors";
import Axios from "axios";

/* msg type url */
const sendMsgType = "/cosmos.bank.v1beta1.MsgSend";

let networks = require("../resources/networks.json");

/*  the validation client is something that should be used on server to confirm payments
    and complete the product / service transaction 
    
    it takes two parameters
    chainID: to use existing rest endPoint for query
    url: developers can choose to configure their own node for query for trust minimization 
*/
export const getValidationClient = (chainID: string, url?: string) => {
  /* Todo: add support for more networks */
  if (!networks[chainID]) throw new Error(ERR_CHAIN_NOT_SUPPORTED);

  /* callback which takes 3 params
    txHash: to query the tx
    isValidPayment: a callback method to customize validation logic 
        (the simplest logic would be to check if amount >= required and recipient matches the owner) 
    onPaymentSuccess: a callback which triggers the main business logic of the product / service
        (Developers can use this callback to update their db and other code logic)
  */
  const processTransaction = async (
    txHash: string,
    isValidPayment: ({ amount, recipient }: isValidTxParams) => boolean,
    onPaymentSuccess: (params: any) => void
  ) => {
    const urlEndpoint: string = url ? url : networks[chainID];
    const result = await getTx(urlEndpoint, txHash);

    if (result.data?.tx_response?.code !== 0) {
      throw new Error(ERR_INVALID_TRANSACTION);
    }

    const tx = result?.data.tx;
    const msg = tx?.body?.messages[0];

    if (!isValidMsg(msg, isValidPayment))
      throw new Error(ERR_INVALID_TRANSACTION);

    const memo = tx?.body?.memo || "";

    try {
      /* 
        memo is the client and server can communication the params required for business logic
        developers need to make sure the frontend and server are following same protocol (JSON.stringify())
        to avoid parsing errors
      */
      const params = JSON.parse(memo);
      onPaymentSuccess(params);
    } catch (err) {
      throw new Error("Unable to parse params");
    }
  };

  return {
    processTransaction: processTransaction,
  };
};

/* transaction fetch call*/
const getTx = async (url: string, txHash: string) => {
  return await Axios.get(url + "/cosmos/tx/v1beta1/txs/" + txHash);
};

/* the payment validation logic which checks the fist Msg params against the passed callback */
const isValidMsg = (
  msg: any,
  isValidPayment: ({ amount, recipient }: isValidTxParams) => boolean
) => {
  if (!msg || msg["@type"] !== sendMsgType)
    throw new Error(ERR_INVALID_TRANSACTION);

  const recipient = msg?.to_address || "";
  const amount = msg?.amount?.[0]?.amount || 0;

  return isValidPayment({ amount, recipient });
};
