document.addEventListener("DOMContentLoaded", () => {

  // for filters
  const filters = document.querySelectorAll(".filter");
  
  filters.forEach(item => {
    item.addEventListener("click", async () => {
      const destination = item.dataset.destination;
      if (!destination) return;

      try {
        const res = await fetch(`/listings?listing[destination]=${destination}`, {
          headers: { "Accept": "application/json" }
        });

        const data = await res.json();

        const container = document.getElementById("listings-container");
        container.className = "row row-col-lg-3 row-col-md-2 row-col-sm-1";
        container.innerHTML = "";

        data.listings.forEach(listing => {
          container.innerHTML += `
            <div class="col">
    <div class="card listing-card" style="width: 25rem;">
      
      <a href="/listings/${listing._id}" class="listing-link" style="text-decoration:none; color:inherit;">
        
        <img class="card-img-top" src="${listing.image.url}" height="250px">
        <div class="card-img-overlay"></div>

        <div class="card-body">
          <h5 class="card-title">${listing.title}</h5>
          
          <p class="card-text">${listing.description}</p>
          
          <p>${listing.title} - ${listing.destination}</p>
          
          <p>
            Price: ₹${listing.price.toLocaleString("en-IN")}/${listing.durationInDays} days
          </p>
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
  });
});
