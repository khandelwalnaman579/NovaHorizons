document.addEventListener("DOMContentLoaded", () => {

  // 🔍 Search functionality
  const searchForm = document.querySelector("form");
  const searchInput = document.querySelector(".search-inp");

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const query = searchInput.value.trim();
      if (!query) return;

      try {
        const res = await fetch(`/listings?search=${query}`, {
          headers: { Accept: "application/json" }
        });

        const data = await res.json();

        const container = document.getElementById("listings-container");
        container.innerHTML = "";

        data.listings.forEach(listing => {
          container.innerHTML += `
            <div class="col-md-4 col-sm-6 mb-3">
              <div class="card listing-card">
                <a href="/listings/${listing._id}" class="listing-link">
                  <img src="${listing.image.url}" class="card-img-top">
                  <div class="card-body">
                    <h5>${listing.title}</h5>
                    <p>${listing.description}</p>
                    <p><b>${listing.destination}</b></p>
                    <p>₹${Number(listing.price).toLocaleString("en-IN")}/${listing.durationInDays} days</p>
                  </div>
                </a>
              </div>
            </div>
          `;
        });

      } catch (err) {
        console.log(err);
      }
    });
  }

});