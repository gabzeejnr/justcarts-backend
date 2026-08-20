import { getRates } from "../helpers/exchangeRate.js";

export async function formatCurrency(amount: number) {
    const response = await getRates();
    const converted = amount * response;

    const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(converted);

    return formatted;
};