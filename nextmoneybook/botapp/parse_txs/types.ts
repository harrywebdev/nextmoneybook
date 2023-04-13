export type FileInStorage = {
    filename: string,
    fullPath: string
}

export enum TransactionAccountType {
    BankAccount = 'bank_account',
    CreditCard = 'credit_card',
}

export enum TransactionCategory {
    StandingOrder = 'standing_order',
    DirectDebit = 'direct_debit',
    Atm = 'atm',
    CardPayment = 'card_payment',
    Fee = 'fee',
    Payment = 'payment',
    Interest = 'interest',
    Unknown = 'unknown',
}

export type Transaction = {
    accountType: TransactionAccountType,
    account: string,
    dateCreated: Date,
    dateCharged: Date,
    category: TransactionCategory,
    offsetAccount: string | null,
    customNote: string | null,
    message: string | null,
    amount: number,
    currency: string,
    txId: string,
    importTxId: string,
}

export type TransactionDbResult = {
    added: number,
    ignored: number,
    total: number,
}

export type TransactionImportResult = TransactionDbResult & {
    action: "import" | "skip"
    filename: string,
}