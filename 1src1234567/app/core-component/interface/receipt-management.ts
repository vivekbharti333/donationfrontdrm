export interface ReceiptManagement {
}

export class InvoiceRequest {
    payload: {
        id?: number; // Changed `Number` to `number` (TypeScript primitive type)
        invoiceNo?: string; // Changed `String` to `string`
        customerId?: string;
        totalItem?: number;
        totalAmount?: number;
        itemName?: string;
        hsnCode?: string;
        rate?: number;
        quantity?: number;
        amount?: number;
        itemDetails?: InvoiceDetails[]; // Proper array type declaration

        token?: string;
        requestFor?: string;
        superadminId?: string;
        createdBy?: string;

        respCode?: string;
        respMesg?: string;
    } = {}; // Ensured `payload` has an initializer to prevent uninitialized property errors

    responseCode?: string;
}

export class InvoiceDetails {
    customerId?: string; // Changed `String` to `string`
    totalItem?: number;
    totalAmount?: number;
    itemName?: string;
    hsnCode?: string;
    rate?: number;
    quantity?: number;
    amount?: number;
    itemDetails?: InvoiceDetails[]; // Proper array type declaration

    token?: string;
    requestFor?: string;
    superadminId?: string;
    createdBy?: string;
}

