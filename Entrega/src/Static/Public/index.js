const socket = io();

document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = this.title.value;
    const price = parseFloat(this.price.value);
    const description = this.description.value;

    socket.emit('agregarproducto', { title, price, description });

    this.reset();
});