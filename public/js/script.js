// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// --------------------------------------
// Add your date validation BELOW this
// --------------------------------------

const availableFrom = document.getElementById("availableFrom");
const availableTo = document.getElementById("availableTo");

if (availableFrom && availableTo) {
  availableFrom.addEventListener("change", () => {
    availableTo.min = availableFrom.value;
  });

   availableTo.addEventListener("change", () => {
    if (availableTo.value < availableFrom.value) {
      availableTo.value = "";
      alert("End date must be after start date");
    }
  });
}