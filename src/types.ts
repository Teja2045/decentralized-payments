export interface paymentClientOption {
  useMnemonic: true;
  mnemonic: string;
}

export interface paymentClientOption {
  onTxSuccess?: (chainID: string, txHash: string) => void;
}

declare global {
  interface WalletWindow extends Window {
    keplr: any;
  }
}
