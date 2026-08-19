export function getProductsUrl(url: string) {
    const parsedUrl = new URL(url);

    const productsIndex = parsedUrl.pathname.indexOf("/products");

    if (productsIndex === -1) {
        throw new Error("URL does not contain /products");
    }

    return `${parsedUrl.origin}${parsedUrl.pathname.slice(0, productsIndex + "/products".length)}`;
}