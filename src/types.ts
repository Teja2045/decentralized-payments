export interface PaymentClientOption {
  useMnemonic: true;
  mnemonic: string;
}

export interface PaymentClientOption {
  onTxSuccess?: (chainID: string, txHash: string) => void;
}

declare global {
  interface WalletWindow extends Window {
    keplr: any;
  }
}

export interface PaymentRequest {
  from: string;
  to: string;
  amount: number;
  denom: string;
  memo: string;
}
