// import { getPaymentClient } from "./client/client";

import { getPaymentClient } from "../dist/index.js";

// example
const pay = async () => {
  const client = await getPaymentClient("osmosis-1", {
    useMnemonic: true,
    mnemonic: "mnemonic xyz"
  });
  try {
    const txHash = await client.makePayment({
      from: "osmo1kv3c86c82ldvmug90lvazvgmrel9txnt2htlfg",
      to: "osmo1y0hvu8ts6m8hzwp57t9rhdgvnpc7yltgh8kr4y",
      amount: 1,
      denom: "uosmo",
      memo: "protocol-X",
    });

    console.log("Tx Hash?", txHash);
  } catch (err) {
    console.log(err);
  }
};

pay();
