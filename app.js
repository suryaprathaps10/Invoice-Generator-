let items = [];

let itemsEl, grand;

/* ===================== ADMIN ===================== */
function saveCompany() {
  const company = {
    name: aName.value,
    address: aAddress.value,
    gstin: aGSTIN.value,
    panIec: aPanIec.value,
    email: aEmail.value,
    phone: aPhone.value,
    bank: {
      bankName: aBankName.value,
      payee: aPayee.value,
      account: aAccount.value,
      branch: aBranch.value,
      address: aBankAddress.value,
      ifsc: aIFSC.value,
      swift: aSwift.value
    },
    signatory: {
      name: aSignatoryName.value,
      designation: aSignatoryDesignation.value
    }
  };
  localStorage.setItem("company", JSON.stringify(company));
  alert("Company details saved");
}

function loadCompanyIntoAdmin() {
  const c = JSON.parse(localStorage.getItem("company"));
  if (!c) return;
  const bank = c.bank || {};
  const sig = c.signatory || {};
  aName.value = c.name || "";
  aAddress.value = c.address || "";
  aGSTIN.value = c.gstin || "";
  aPanIec.value = c.panIec || "";
  aEmail.value = c.email || "";
  aPhone.value = c.phone || "";
  aBankName.value = bank.bankName || "";
  aPayee.value = bank.payee || "";
  aAccount.value = bank.account || "";
  aBranch.value = bank.branch || "";
  aBankAddress.value = bank.address || "";
  aIFSC.value = bank.ifsc || "";
  aSwift.value = bank.swift || "";
  aSignatoryName.value = sig.name || "";
  aSignatoryDesignation.value = sig.designation || "";
}

/* ===================== INVOICE ===================== */
function addItem() {
  items.push({ d: "", sac: "", q: 1, r: 0 });
  render();
}

function render() {
  if (!itemsEl || !grand) return;

  itemsEl.innerHTML = "";

  items.forEach((item, index) => {
    const row = document.createElement("tr");

    const slTd = document.createElement("td");
    slTd.textContent = index + 1;

    const descTd = document.createElement("td");
    const sacTd = document.createElement("td");
    const qtyTd = document.createElement("td");
    const rateTd = document.createElement("td");
    const amountTd = document.createElement("td");
    const actionTd = document.createElement("td");

    /* ---------- Description ---------- */
    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.value = item.d;
    descInput.oninput = () => {
      item.d = descInput.value;
    };
    descTd.appendChild(descInput);

    /* ---------- SAC Code ---------- */
    const sacInput = document.createElement("input");
    sacInput.type = "text";
    sacInput.value = item.sac;
    sacInput.oninput = () => {
      item.sac = sacInput.value;
    };
    sacTd.appendChild(sacInput);

    /* ---------- Quantity ---------- */
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = item.q;
    qtyInput.oninput = () => {
      item.q = Number(qtyInput.value) || 0;
      updateTotals();
      amountTd.textContent = (item.q * item.r).toFixed(2);
    };
    qtyTd.appendChild(qtyInput);

    /* ---------- Rate ---------- */
    const rateInput = document.createElement("input");
    rateInput.type = "number";
    rateInput.min = "0";
    rateInput.value = item.r;
    rateInput.oninput = () => {
      item.r = Number(rateInput.value) || 0;
      updateTotals();
      amountTd.textContent = (item.q * item.r).toFixed(2);
    };
    rateTd.appendChild(rateInput);

    /* ---------- Amount ---------- */
    amountTd.textContent = (item.q * item.r).toFixed(2);

    /* ---------- Delete ---------- */
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.onclick = () => {
      items.splice(index, 1);
      render();
    };
    actionTd.appendChild(delBtn);

    row.append(slTd, descTd, sacTd, qtyTd, rateTd, amountTd, actionTd);
    itemsEl.appendChild(row);
  });

  updateTotals();
}

function updateTotals() {
  const total = items.reduce((sum, item) => sum + item.q * item.r, 0);
  grand.textContent = total.toFixed(2);

  const rate = (typeof conversionRate !== "undefined" && conversionRate) ? (Number(conversionRate.value) || 0) : 0;
  if (rate > 0 && typeof valueInINR !== "undefined" && valueInINR) {
    valueInINR.value = (total * rate).toFixed(2);
  }

  updateValueInWords(total);
}

/* ===================== AMOUNT IN WORDS (auto-generated) ===================== */
const CURRENCY_NAMES = {
  "$": { main: "US Dollar", sub: "Cent" },
  "€": { main: "Euro", sub: "Cent" },
  "£": { main: "British Pound", sub: "Pence", subInvariant: true },
  "AED": { main: "UAE Dirham", sub: "Fils", subInvariant: true }
};

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function threeDigitsToWords(n) {
  let str = "";
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ONES[n] + " ";
  }
  return str.trim();
}

function integerToWords(num) {
  if (num === 0) return "Zero";

  const groups = [
    { value: 1000000000, label: "Billion" },
    { value: 1000000, label: "Million" },
    { value: 1000, label: "Thousand" },
    { value: 1, label: "" }
  ];

  let remaining = num;
  const parts = [];

  for (const group of groups) {
    const count = Math.floor(remaining / group.value);
    if (count > 0) {
      parts.push(threeDigitsToWords(count) + (group.label ? " " + group.label : ""));
      remaining %= group.value;
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function amountToWords(amount, currencySymbol) {
  const names = CURRENCY_NAMES[currencySymbol] || { main: "Unit", sub: "Cent" };
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  const wholePart = Math.floor(rounded);
  const fractionPart = Math.round((rounded - wholePart) * 100);

  let words = integerToWords(wholePart) + " " + names.main + (wholePart === 1 ? "" : "s");

  if (fractionPart > 0) {
    words += " and " + integerToWords(fractionPart) + " " + names.sub + (fractionPart === 1 ? "" : "s");
  }

  return words + " Only";
}

function updateValueInWords(total) {
  if (typeof valueInWords === "undefined" || !valueInWords) return;
  const symbol = (typeof currency !== "undefined" && currency) ? currency.value : "$";
  valueInWords.value = amountToWords(total, symbol);
}

function generateInvoiceNumber(dateStr) {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const dateKey = `${dd}${mm}${yyyy}`;
  const counterKey = `invoice_counter_${dateKey}`;

  let count = Number(localStorage.getItem(counterKey)) || 0;
  count += 1;

  localStorage.setItem(counterKey, count);

  const seq = String(count).padStart(2, "0");

  return `USPN${dateKey}${seq}`;
}

function previewInvoice() {
  const invoiceNumber = generateInvoiceNumber(billingDate.value);

  const invoice = {
    invoiceNumber,
    company: JSON.parse(localStorage.getItem("company")),
    client: {
      name: clientName.value,
      email: clientEmail.value,
      address: clientAddress.value,
      country: clientCountry.value
    },
    date: billingDate.value,
    placeOfSupply: placeOfSupply.value,
    currency: currency.value,
    items,
    total: grand.textContent,
    valueInWords: valueInWords.value,
    conversionRate: conversionRate.value,
    valueInINR: valueInINR.value
  };

  localStorage.setItem("invoice", JSON.stringify(invoice));
  location.href = "preview.html";
}

/* ===================== PREVIEW ===================== */
function loadPreview() {
  const d = JSON.parse(localStorage.getItem("invoice"));
  if (!d) return;

  const c = d.company || {};
  const bank = c.bank || {};
  const sig = c.signatory || {};

  pSupplierName.textContent = c.name || "";
  pSupplierAddress.textContent = c.address || "";
  pGSTIN.textContent = c.gstin || "";
  pPanIec.textContent = c.panIec || "";
  pSupplierEmail.textContent = c.email || "";

  pInvoiceNumber.textContent = d.invoiceNumber;
  pBillingDate.textContent = d.date;
  pPlaceOfSupply.textContent = d.placeOfSupply;

  pClient.textContent = d.client.name;
  pClientAddress.textContent = d.client.address;
  pClientCountry.textContent = d.client.country;
  pClientEmail.textContent = d.client.email;

  const currencySymbol = d.currency || "";

  d.items.forEach((i, idx) => {
    pItems.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${i.d}</td>
        <td>${i.sac}</td>
        <td>${i.q}</td>
        <td>${currencySymbol} ${Number(i.r).toFixed(2)}</td>
        <td>${currencySymbol} ${(i.q * i.r).toFixed(2)}</td>
      </tr>`;
  });

  pGrand.textContent = `${currencySymbol} ${d.total}`;

  pValueInWords.textContent = d.valueInWords || "…";
  pConversionRate.textContent = d.conversionRate ? d.conversionRate : "…";
  pValueInINR.textContent = d.valueInINR ? `₹ ${d.valueInINR}` : "…";

  pBankName.textContent = bank.bankName || "";
  pAccount.textContent = bank.account || "";
  pIFSC.textContent = bank.ifsc || "";
  pSwift.textContent = bank.swift || "";

  pSignatoryName.textContent = sig.name || "";
  pSignatoryDesignation.textContent = sig.designation || "";
}

/* ===================== DOWNLOAD (native browser print-to-PDF) ===================== */
function downloadPDF() {
  // The browser's own print engine renders colors, borders and page breaks
  // correctly every time. Choose "Save as PDF" as the destination in the
  // print dialog that opens.
  window.print();
}

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", () => {
  itemsEl = document.getElementById("items");
  grand = document.getElementById("grand");

  if (itemsEl) addItem();
  if (document.getElementById("aName")) loadCompanyIntoAdmin();
  if (document.getElementById("pSupplierName")) loadPreview();

  if (document.getElementById("currencyLabel") && currency) {
    currencyLabel.textContent = currency.value;
    currency.addEventListener("change", () => {
      currencyLabel.textContent = currency.value;
      updateTotals();
    });
  }

  if (typeof conversionRate !== "undefined" && conversionRate) {
    conversionRate.addEventListener("input", updateTotals);
  }
});