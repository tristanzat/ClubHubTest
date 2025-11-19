

export async function getJson() {
    let data = {};
    const response = await fetch("societies.json");
    if (response.ok) {
        data = await response.json();
    } else throw new Error("response not ok");

    return data;
}