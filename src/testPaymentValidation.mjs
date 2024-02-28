

import {getValidationClient} from "../../dist/index.js"

const chainID = "cosmoshub-4";
const txHash =
  "AF3A42ABF295F7F17ABB9490DE562629540D82F8CFCBDD990AAC9998F8DDEAEE";
 const url = "https://cosmoshub-api.lavenderfive.com:443"

const client = getValidationClient(chainID, url);

const onSuccess = (params) => {
  console.log(params, "great");
};

const isValid = (params) => {
  return (
    params.amount >= 10 &&
    params.recipient === "cosmos1gmap7jr5wj3qatp23lqya82j3eq5jdgf3drgv2"
  );
};

try {
  client.processTransaction(txHash, isValid, onSuccess);
} catch(err) {
  console.log(err)
}