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

export interface isValidTxParams {
  amount: number;
  recipient: string;
}

export interface processPaymentParams {
  txHash: string;
  isValidPayment: ({ amount, recipient }: isValidTxParams) => boolean;
  onPaymentSuccess: (params: any) => void;
}
