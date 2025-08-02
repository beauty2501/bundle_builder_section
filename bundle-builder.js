document.addEventListener("DOMContentLoaded", function () {
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");
  const bundleItems = document.getElementById("bundle-items");
  const addToCartBtn = document.getElementById("add-to-cart-bundle");
  const bundleSidebar = document.getElementById("bundle_sidebar");
  const sectionElement = document.querySelector('.bundle-builder[id^="collection-"]');
  const sectionId = sectionElement?.dataset.sectionId;
  const progressBar = document.querySelector('.progress-bar');

  // Get the bundle product details from the local storage
  let bundle = JSON.parse(localStorage.getItem("custom_bundle") || "[]");

  // Save the bundle product details from the local storage
  function saveBundle() {
    localStorage.setItem("custom_bundle", JSON.stringify(bundle));
  }

  // Update sstate all the bundle buttons
  function restoreQtyInputs() {
    document.querySelectorAll(".add-to-bundle").forEach(btn => {
      const found = bundle.find(p => p.id === btn.dataset.id);
      const qtyInput = document.querySelector(`.qty-input[data-id="${btn.dataset.id}"]`);

      const label = btn.querySelector('.bundle-label');
      const icon = btn.querySelector('.bundle-icon');

      if (found) {
        if (label) label.textContent = "Added to Bundle";
        btn.disabled = true;
        if (qtyInput) {
          qtyInput.disabled = true;
          qtyInput.value = found.quantity;
        }
      } else {
        if (label) label.textContent = "Add to Bundle";
        btn.disabled = false;
        if (qtyInput) {
          qtyInput.disabled = false;
          qtyInput.value = 1;
        }
      }
    });
  }

  // Update the visual represention of the selected product items. Renders upto 3 products
  function updateBundle() {
    bundleItems.innerHTML = "";
    let subtotal = 0;

    for (let i = 0; i < 3; i++) {
      const item = bundle[i];
      const wrapper = document.createElement("li");
      wrapper.className = "bundle-item";

      if (item) {
        const imageWrap = document.createElement("div");
        imageWrap.className = "imageDiv";
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.title;
        img.style.width = "88px";
        img.style.height = "88px";
        img.style.objectFit = "cover";
        imageWrap.appendChild(img);

        const details = document.createElement("div");
        details.className = "bundle-product-details";

        const title = document.createElement("div");
        title.textContent = item.title;
        title.className = "bundle-product-title";

        const price = document.createElement("div");
        price.textContent = `$${((item.price * item.quantity) / 100).toFixed(2)}`;
        price.className = "bundle-product-price";

        const qtyControls = document.createElement("div");
        qtyControls.className = "quantity-selector";

        const qtyIcons = document.createElement("span");
        qtyIcons.className = "quantity-icons";

        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";
        minusBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" viewBox="0 0 10 2" fill="none">
            <path d="M9.80005 0.149994V1.14999H0.800049V0.149994H9.80005Z" fill="#111111"/>
            </svg>`
        minusBtn.className = "minus-icon";
        minusBtn.onclick = () => {
          if (item.quantity > 1) {
            item.quantity--;
            saveBundle();
            updateBundle();
            restoreQtyInputs();
          }
        };

        const qtyDisplay = document.createElement("span");
        qtyDisplay.textContent = item.quantity;
        qtyDisplay.className = "quantity-value";

        const plusBtn = document.createElement("button");
        plusBtn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.80005 9.89999H5.80005V5.89999H9.80005V4.89999H5.80005V0.899994H4.80005V4.89999H0.800049V5.89999H4.80005V9.89999Z" fill="#111111"/>
          </svg>`
        plusBtn.className = "plus-icon";
        plusBtn.onclick = () => {
          item.quantity++;
          saveBundle();
          updateBundle();
          restoreQtyInputs();
        };

        const removeBtn = document.createElement("button");
          removeBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 3V4H4V6H5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V6H20V4H15V3H9ZM7 6H17V19H7V6ZM9 8V17H11V8H9ZM13 8V17H15V8H13Z"/>
        </svg>`;

        removeBtn.className = "delete-icon";
        removeBtn.onclick = () => {
          bundle.splice(i, 1);
          saveBundle();
          updateBundle();
          restoreQtyInputs();
          updateProgressBar();
          updateCompletedClass();
        };

        qtyIcons.appendChild(minusBtn);
        qtyIcons.appendChild(qtyDisplay);
        qtyIcons.appendChild(plusBtn);
        qtyControls.appendChild(qtyIcons);

        details.appendChild(title);
        details.appendChild(price);
        details.appendChild(qtyControls);
        details.appendChild(removeBtn);

        wrapper.appendChild(imageWrap);
        wrapper.appendChild(details);

        subtotal += item.price * item.quantity;
      } else {
        wrapper.innerHTML = `<span class="block-one block"></span><span class="block-two block"></span>`;
      }

      bundleItems.appendChild(wrapper);
    }

    const discountPercentage = parseFloat(bundleItems.dataset.discount);
    const discount = subtotal * (discountPercentage / 100);

    const total = subtotal - discount;
    discountEl.innerHTML = `- $<span>${(discount / 100).toFixed(2)}</span>${subtotal > 0 ? `<span> (${discountPercentage}%)</span>` : ''}`;
    totalEl.textContent = `$${(total / 100).toFixed(2)}`;

    addToCartBtn.disabled = bundle.length !== 3;
  }

  // Quantity increase functionality in the selcted bundle item in bundle div
  document.querySelectorAll(".qty-increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.querySelector(`.qty-input[data-id="${btn.dataset.id}"]`);
      let val = parseInt(input.value);
      if (val < 10) input.value = val + 1;
    });
  });

   // Quantity decrease functionality in the selcted bundle item in bundle div
  document.querySelectorAll(".qty-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.querySelector(`.qty-input[data-id="${btn.dataset.id}"]`);
      let val = parseInt(input.value);
      if (val > 1) input.value = val - 1;
    });
  });

  // Handles bundle product selection, cart submission, and UI updates on bundle click event.
  document.querySelectorAll(".add-to-bundle").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const title = button.dataset.title;
      const price = parseFloat(button.dataset.price) * 100;
      const image = button.dataset.image;

      const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
      const quantity = parseInt(qtyInput?.value || "1");

      const existing = bundle.find(p => p.id === id);
      const currentTotal = bundle.reduce((sum, item) => sum + item.quantity, 0);

      if (currentTotal + quantity > 3) {
        return;
      }

    if (existing) {
      existing.quantity += quantity;
    } else {
      bundle.push({ id, title, price, image, quantity });
    }
    saveBundle();
    updateBundle();
    restoreQtyInputs();
    updateProgressBar();
    updateCompletedClass();
        });
      });

      addToCartBtn.addEventListener("click", async () => {
        for (const item of bundle) {
          await fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id, quantity: item.quantity })
          });
        }
        localStorage.removeItem("custom_bundle");
        window.location.href = "/cart";
      });

      function updateCompletedClass() {
      const currentTotal = bundle.reduce((sum, item) => sum + item.quantity, 0);

      if (currentTotal >= 3) {
        sectionElement.classList.add("completed");
      } else {
        sectionElement.classList.remove("completed");
      }
    }

    function updateProgressBar() {
      const currentTotal = bundle.reduce((sum, item) => sum + item.quantity, 0);
      const progress = Math.min((currentTotal / 3) * 100, 100);
      if (progressBar) progressBar.style.width = `${progress}%`;
    }

    // Initiate the functions
    updateBundle();
    restoreQtyInputs();
    updateProgressBar();
    updateCompletedClass();
});

