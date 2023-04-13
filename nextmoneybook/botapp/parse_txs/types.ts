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
export type CurrentAccountCsvRow = {
    'Datum provedení': string,
    'Datum zaúčtování': string,
    'Číslo účtu': string,
    'Název účtu': string,
    'Kategorie transakce': string,
    'Číslo protiúčtu': string,
    'Název protiúčtu': string,
    'Typ transakce': string,
    'Zpráva': string,
    'Poznámka': string,
    VS: string,
    KS: string,
    SS: string,
    'Zaúčtovaná částka': string,
    'Měna účtu': string,
    'Původní částka a měna': string,
    Poplatek: string,
    'Id transakce': string,
    'Vlastní poznámka': string,
    'Název obchodníka': string,
    'Město': string,
}

export type CreditCardCsvRow = {
    'Číslo kreditní karty': string
    'Držitel karty': string
    'Datum transakce': string
    'Datum zúčtování': string
    'Typ transakce': string
    'Původní částka': string
    'Původní měna': string
    'Zaúčtovaná částka': string
    'Měna zaúčtování': string
    'Převodní kurs': string
    'Popis/Místo transakce': string
    'Vlastní poznámka': string
    'Název obchodníka': string
    'Město': string
}