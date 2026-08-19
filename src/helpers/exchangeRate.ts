import axios from "axios";

export async function getRates() {
    try {
        const {data} = await axios.get("https://api.frankfurter.dev/v2/rate/USD/NGN");
        const response = data.rate
        return response;
    } catch (err) {
        console.error("Couldn't get exchange rates:", err)
    }
}