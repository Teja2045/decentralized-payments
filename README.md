# decentralized-payments

## On frontend

install package using command

    npm install decentralized-payments

## Usage

### To check currently supported chains

```
import {supportedChains} from "decentralized-payments"

console.log(supportedChains())
```

### To make payment Client

```
import {getPaymentClient} from "decentralized-payments"

// to build a client from keplr signer (keplr has to be installed on frontend)
const client = await getPaymentClient("osmosis-1");

```

or

```
// to builder a client from mnemonic (DirectSecp256k1HdWallet)
const client = await getPaymentClient("osmosis-1", {
    useMnemonic: true,
    mnemonic: "mnemonic xyz"
  });

```

    Note: It is advised to use the first version as it is more secure

### Side effect on payment success

pass in a callback in case you want perform some effects if the the transaction is successful or you want to hit the payment verification endpoint on the server

```
const informServer = (chainID: string, txHash: string) => {
// hit server
// axios.post(paymentServerEndpoint);
}

const client = await getPaymentClient("osmosis-1", {

    useMnemonic: true,
    mnemonic: "mnemonic xyz",
    onTxSuccess: informServer

});

// or

const client2 = await getPaymentClient("osmosis-1", {
    onTxSuccess: informServer
});

```

### To make payment

```
// These are minimal mandatory fields for a payment system to work
    const txHash = await client.makePayment({
      from: yourChainAddress,
      to: productOwnerChainAddress,
      amount: productCost,
      denom: chainDenom,
      memo: protocolParams,
    });

```

### Memo to communication params between frontend and server

    Memo: protocolParams

    this is a very important field to communicate the buyer's details to the server so that server can process the business logic after confirming the payment

Example:

```
    // lets say the product is a video
    // the server needs the gmail address of the buyers to sent the video after confirming the payment

    interface Params {
        gmail: string
    }

    const params = {
        gmail: "saiteja@xyz.com"
    }

    // pass it after converting it to a json string

    const memo = JSON.stringify(params);

    // so when processing the payment from on server, the server can parse the params

    const memo = tx.memo
    const params = JSON.parse(memo);

    const gmail = params.gmail

```

<br>
<br>
<br>
<br>

## On server

### To get validation Client

Example:

```

import {getValidationClient} from "decentralized-payments"

// existing chain configuration i.e node rest url
const client = getValidationClient(chainID);

// or

// for trust minimization, use your own or the familiar node endpoint

const client2 = getValidationClient(chainID, url);
```

### define validation and businness logic callbacks

1. isValid callback: to validate the the payment details of the transaction

Example:

```

// A simple implementation is check if the transaction amount >= the product amount and the transaction recipient == the seller's address
const isValid = (params) => {
  return (
    params.amount >= productCost &&
    params.recipient === sellerAddress
  );
};
```

2. OnSuccess callback: this is where the core logic of the product transfer should be written. It will be triggered if the payment is success

Example

```
const onSuccess = (params) => {
  // write the business logic

  // update the db
  // transfer the product
  // etc..
};
```

### Call the payment verification and processing method

Example:

```

 client.processTransaction(txHash, isValid, onSuccess);

```

If you have any query, dm me on my linkedin

https://www.linkedin.com/in/saitejae/
