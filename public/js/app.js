const searchInput = document.getElementById("searchInput");
const rows = document.querySelectorAll("tbody tr");
const noResult = document.getElementById("no-result");
const searchContain = document.getElementById("search-contain");
const mobileQuery = window.matchMedia("(max-width: 765px)");

searchInput.addEventListener("input", (e) => {
  let found = false;
  const filter = e.target.value.toLowerCase().replace(/\s+/g, "");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase().replace(/\s+/g, "");
    if (text.includes(filter)) {
      found = true;
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
  noResult.style.display = found ? "none" : "block";
});
function onFocusMobile() {
  searchContain.classList.remove("w-12");
  searchContain.classList.add("w-32", "gap-1");
  searchInput.placeholder = "Search Product";
}
function onBlurMobile() {
  searchContain.classList.add("w-12");
  searchContain.classList.remove("w-32", "gap-1");
  searchInput.placeholder = "...";
}
function handleMobileFocus(e) {
  searchInput.removeEventListener("focus", onFocusMobile);
  searchInput.removeEventListener("blur", onBlurMobile);
  if (e.matches) {
    searchInput.addEventListener("focus", onFocusMobile);
    searchInput.addEventListener("blur", onBlurMobile);
    searchInput.placeholder = "...";
  } else {
    searchInput.placeholder = "Search Product";
  }
}
handleMobileFocus(mobileQuery);
mobileQuery.addEventListener("change", handleMobileFocus);

const openBtn = document.getElementById("modalBtn");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("tableModal");
const priceInput = document.getElementById("productPrice");
const stockInput = document.getElementById("productStock");

openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
function format(v) {
  return v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function attachFormatter(input) {
  if (!input) return;
  input.addEventListener("input", () => {
    input.value = format(input.value);
  });
}
attachFormatter(priceInput);
attachFormatter(stockInput);

const filterMenu = document.getElementById("filterMenu");
const filterBtn = document.getElementById("filterBtn");

filterBtn.addEventListener("click", () => {
  filterMenu.classList.toggle("hidden");
});

// =================== ADD PRODUCT ===================
const addProductForm = document.getElementById("addProductForm");

addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const productName = document.getElementById("productName").value;
  const productPrice = Number(
    document.getElementById("productPrice").value.replace(/\./g, "")
  );
  const productStock = Number(
    document.getElementById("productStock").value.replace(/\./g, "")
  );

  const formData = new URLSearchParams();
  formData.append("productName", productName);
  formData.append("productPrice", productPrice);
  formData.append("productStock", productStock);

  const res = await fetch("/product", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    modal.classList.add("hidden"); // tutup modal
    location.reload(); // reload halaman
  }
});

// =================== DELETE PRODUCT ===================
// Modal konfirmasi Tailwind
const confirmModal = document.getElementById("confirmModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

let currentDeleteBtn = null;

const deleteBtns = document.querySelectorAll(".deleteBtn");
deleteBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentDeleteBtn = btn;
    confirmModal.classList.remove("hidden"); // tampilkan modal
  });
});

cancelDelete.addEventListener("click", () => {
  currentDeleteBtn = null;
  confirmModal.classList.add("hidden"); // sembunyikan modal
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!currentDeleteBtn) return;

  const id = currentDeleteBtn.getAttribute("data-id");

  try {
    const res = await fetch(`/product/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      currentDeleteBtn.closest("tr").remove();
    } else {
      alert(data.message || "Gagal hapus produk!");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi error saat hapus produk!");
  } finally {
    confirmModal.classList.add("hidden");
    currentDeleteBtn = null;
  }
});

// Edit Produk
const editBtns = document.querySelectorAll(".editBtn");
const editModal = document.getElementById("editModal");
const cancelEdit = document.getElementById("cancelEdit");
const editForm = document.getElementById("editForm");
const editPrice = document.getElementById("editPrice");
const editStock = document.getElementById("editStock");

let currentEditId = null;

// Format input (misal: 10.000)
function formatNumberInput(input) {
  input.addEventListener("input", () => {
    input.value = input.value
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  });
}
formatNumberInput(editPrice);
formatNumberInput(editStock);

editBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentEditId = btn.getAttribute("data-id");

    // Ambil harga dan stok dari tabel
    const row = btn.closest("tr");
    const price = row
      .querySelector("td:nth-child(3)")
      .textContent.replace(/\D/g, "");
    const stock = row.querySelector("td:nth-child(4)").textContent;

    editPrice.value = price;
    editStock.value = stock;

    editModal.classList.remove("hidden");
  });
});

cancelEdit.addEventListener("click", () => {
  currentEditId = null;
  editModal.classList.add("hidden");
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const updatedPrice = Number(editPrice.value.replace(/\./g, ""));
  const updatedStock = Number(editStock.value.replace(/\./g, ""));

  try {
    const res = await fetch(`/product/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: updatedPrice, stock: updatedStock }),
    });

    const data = await res.json();
    if (data.success) {
      // Update row di tabel tanpa reload
      const row = document
        .querySelector(`.editBtn[data-id="${currentEditId}"]`)
        .closest("tr");
      row.querySelector(
        "td:nth-child(3)"
      ).textContent = `Rp ${updatedPrice.toLocaleString("id-ID")}`;
      row.querySelector("td:nth-child(4)").textContent = updatedStock;

      editModal.classList.add("hidden");
    } else {
      alert(data.message || "Gagal update produk!");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi error saat update produk!");
  }
});



function filterStock(type) {
  const tableBody = document.querySelector("tbody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));

  let sortedRows;

  if (type === "highest") {
    sortedRows = rows.sort((a, b) => {
      const stockA = Number(a.querySelector("td:nth-child(5)").textContent);
      const stockB = Number(b.querySelector("td:nth-child(5)").textContent);
      return stockB - stockA;
    });
  } else if (type === "lowest") {
    sortedRows = rows.sort((a, b) => {
      const stockA = Number(a.querySelector("td:nth-child(5)").textContent);
      const stockB = Number(b.querySelector("td:nth-child(5)").textContent);
      return stockA - stockB;
    });
  } else if (type === "date") {
    sortedRows = rows.sort((a, b) => {
      const dateA = new Date(
        a.querySelector("td[data-tanggal]").dataset.tanggal
      );
      const dateB = new Date(
        b.querySelector("td[data-tanggal]").dataset.tanggal
      );
      return dateB - dateA; // terbaru di atas
    });
  } else if (type === "reset") {
    return window.location.reload();
  }

  tableBody.innerHTML = "";
  sortedRows.forEach((row) => tableBody.appendChild(row));
}
