
export enum TransactionType {
  GST = 'GST',
  NON_GST = 'Non-GST'
}

export interface Transaction {
  id: string;
  accountId: string; // bank1, bank2, bank3, bank4, cash
  date: string;
  particulars: string;
  type: TransactionType;
  paymentIn: number;
  paymentOut: number;
  runningBalance: number;
  createdAt: number;
}

export interface BankConfig {
  id: string;
  name: string;
}

export interface User {
  username: string;
  password?: string;
  isAdmin: boolean;
}

export interface AppState {
  currentUser: User | null;
  transactions: Transaction[];
  bankConfigs: BankConfig[];
}
