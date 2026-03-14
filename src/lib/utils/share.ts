export function encodeBillData(data: any) {
    try {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json));
    } catch (e) {
        console.error("Failed to encode data", e);
        return "";
    }
}

export function decodeBillData(encoded: string) {
    try {
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to decode data", e);
        return null;
    }
}
