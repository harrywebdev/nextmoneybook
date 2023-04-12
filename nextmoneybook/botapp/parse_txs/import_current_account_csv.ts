const md5 = require('md5');

export type CurrentAccountCsvRow = {
    'Datum proveden�': string,
    'Datum za��tov�n�': string,
    '��slo ��tu': string,
    'N�zev ��tu': string,
    'Kategorie transakce': string,
    '��slo proti��tu': string,
    'N�zev proti��tu': string,
    'Typ transakce': string,
    'Zpr�va': string,
    'Pozn�mka': string,
    VS: string,
    KS: string,
    SS: string,
    'Za��tovan� ��stka': string,
    'M�na ��tu': string,
    'P�vodn� ��stka a m�na': string,
    Poplatek: string,
    'Id transakce': string,
    'Vlastn� pozn�mka': string,
    'N�zev obchodn�ka': string,
    'M�sto': string,
}

function transformCategory(category: string) {
    if (category.indexOf('Trval') >= 0) {
        return "standing_order"
    }

    if (category.indexOf('Inkaso') >= 0) {
        return "direct_debit"
    }

    if (category.indexOf('bankomat') >= 0) {
        return "atm"
    }

    if (category.indexOf('kartou') >= 0) {
        return "card_payment"
    }

    if (category.indexOf('Poplatek') >= 0) {
        return "fee"
    }

    if (category.indexOf('Platba') >= 0) {
        return "payment"
    }

    if (category.indexOf('rok') >= 0) {
        return "interest"
    }

    return "unknown";
}

function transformAmount(amount: string) {
    // eg. -23 305,68
    return parseInt(amount.replace(/[ , ]*/gi, ''), 10);
}

function transformDate(dateString: string) {
    // eg. 03.04.2023
    // eg. 29.03.2023 06:06
    const [date, time] = dateString.split(' ');

    const timeDefault = (timeChunk: string | undefined) => timeChunk ? timeChunk : '00'

    const dateChunks = date.substring(0, 10).split('.')
    const timeChunks = time ? time.split(':') : ['00', '00', '00']
    const formattedDate = `${dateChunks[2]}-${dateChunks[1]}-${dateChunks[0]}`
    const formattedTime = `${timeDefault(timeChunks[0])}:${timeDefault(timeChunks[1])}:${timeDefault(timeChunks[2])}`

    return `${formattedDate} ${formattedTime}.000`
}

export default async function importCurrentAccountCsv(csv: CurrentAccountCsvRow[]) {
    const values = csv.map(row => {
        // the strings are terrible, let's just use indexes
        const rowValues = Object.values(row);

        const value = {
            date_created: transformDate(rowValues[0]),
            date_charged: transformDate(rowValues[1]),
            category: transformCategory(rowValues[4]),
            offset_account: rowValues[5] || null,
            custom_note: `${rowValues[6] !== "" ? rowValues[6] + ', ' : ''}${rowValues[20] !== "" ? rowValues[20] + ', ' : ''}${rowValues[9]}` || null,
            message: rowValues[8] || null,
            amount: transformAmount(rowValues[13]),
            currency: rowValues[14],
            tx_id: rowValues[18],
            import_id: '',
        }

        value.import_id = md5(`${value.tx_id}${value.date_created}${value.amount}`)

        return value;
    });

    // TODO: save the values in DB

    // TODO: return some kind of result

    return values;
}