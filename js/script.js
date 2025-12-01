const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".society-card");

searchInput.addEventListener("input", function () {
    const text = searchInput.value.toLowerCase();

    cards.forEach(card => {
        const name = card.querySelector("h3").textContent.toLowerCase();
        const description = card.querySelector("p").textContent.toLowerCase();

        if (name.includes(text) || description.includes(text)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});
