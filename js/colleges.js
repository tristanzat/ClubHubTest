// handle search form
document.querySelector(".college-search-form").addEventListener("submit", async function Submit (event) {
    event.preventDefault();

    const input = document.querySelector(".search-input").value;
    const searchedList = await getSearchResults(input);

    const societyList = document.querySelector(".colleges-container");
    societyList.innerHTML = "";

    for (const college of searchedList) {
        societyList.innerHTML += collegeTemplate(college);
    }
})

