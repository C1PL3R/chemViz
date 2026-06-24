async function SendData(url, data, method = "POST") {
    const response = await fetch(url, {
        method,
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(result.error || "Сталася помилка на сервері!");
        error.response = { data: result };
        throw error;
    }

    return result;
}
