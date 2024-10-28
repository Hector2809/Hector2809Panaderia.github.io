document.addEventListener("DOMContentLoaded", () => { 
    const form = document.getElementById("formAgregarProducto");
    const table = document.getElementById("tablaProductos");

    fetchInventory();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("nombreProducto").value.trim();
        const price = document.getElementById("precioProducto").value.trim();
        const quantity = document.getElementById("cantidadProducto").value.trim();

        if (!validarCampos(name, price, quantity)) {
            return;
        }

        const productData = { name, price: parseFloat(price), quantity: parseInt(quantity) };

        fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            alert("Producto agregado exitosamente");
            fetchInventory();
            form.reset();
        })
        .catch(error => {
            console.error("Error al agregar producto:", error);
            alert("Error al agregar producto.");
        });
    });

    function fetchInventory() {
        fetch("/api/inventory")
            .then(response => response.json())
            .then(products => {
                table.querySelector("tbody").innerHTML = "";
                products.forEach(addToTable);
            });
    }

    function validarCampos(name, price, quantity) {
        if (!name) {
            alert("Por favor, ingresa un nombre de producto válido.");
            return false;
        }
        if (!isFinite(price) || price <= 0) {
            alert("Por favor, ingresa un precio válido mayor a 0.");
            return false;
        }
        if (!Number.isInteger(Number(quantity)) || quantity <= 0) {
            alert("Por favor, ingresa una cantidad válida.");
            return false;
        }
        return true;
    }

    function addToTable(product) {
        const row = table.insertRow();
        row.insertCell(0).textContent = product.nombre;
        row.insertCell(1).textContent = `$${parseFloat(product.precio).toFixed(2)}`;
        row.insertCell(2).textContent = product.cantidad;
        row.insertCell(3).innerHTML = `
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;

        row.querySelector(".edit-btn").addEventListener("click", () => editProduct(row, product));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(row, product.id));
    }

    function editProduct(row, product) {
        const newName = prompt("Nuevo nombre:", product.nombre);
        const newPrice = prompt("Nuevo precio:", product.precio);
        const newQuantity = prompt("Nueva cantidad:", product.cantidad);

        if (!validarCampos(newName, newPrice, newQuantity)) {
            return;
        }

        const updatedProduct = {
            name: newName,
            price: parseFloat(newPrice),
            quantity: parseInt(newQuantity),
        };

        fetch(`/api/products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct),
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(() => {
            alert("Producto actualizado exitosamente.");
            fetchInventory();
        })
        .catch(error => {
            console.error("Error al actualizar producto:", error);
            alert("Error al actualizar producto.");
        });
    }

    function deleteProduct(row, productId) {
        if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

        fetch(`/api/products/${productId}`, { method: "DELETE" })
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(() => {
                alert("Producto eliminado exitosamente.");
                row.remove();
            })
            .catch(error => {
                console.error("Error al eliminar producto:", error);
                alert("Error al eliminar producto.");
            });
    }
});