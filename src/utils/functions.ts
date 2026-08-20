function getUrlHost(url: string) {
    const parsedUrl = new URL(url);
    const urlHost = parsedUrl.hostname;
    return urlHost
}

export function changeDot(url: string) {
    const host = getUrlHost(url);
    const parseHost = host.replace(/\./g, "-")
    return parseHost;
}