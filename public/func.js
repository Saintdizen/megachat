// Get the modal, buttons, and close element
let modal = document.getElementById("popup-modal");
let openBtn = document.getElementById("button_users");
let closeBtn = document.getElementsByClassName("close-button")[0];

openBtn.addEventListener("click", () => {
    console.log("clicked");
    modal.style.display = "flex";
})

// When the user clicks on (x), close the modal
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}