var wallet_text = document.getElementById('wallet-text');
var add_button = document.getElementById('add-button');
var wallet = 0;

add_button.addEventListener('click', function() {
    wallet++;
    wallet_text.textContent = wallet;
});