document
  .getElementById("excludeCompanyButton")
  .addEventListener("click", onExcludeCompanyButtonClick);

document
  .getElementById("clearAllExcludedCompaniesButton")
  .addEventListener("click", onClearAllExcludedCompaniesButtonClick);

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "excludedCompanies") {
      await populateExcludedCompaniesTextArea();
    }
  }
});

await populateExcludedCompaniesTextArea();

async function populateExcludedCompaniesTextArea() {
  const excludedCompanies = await getExcludedCompaniesFromStorage();

  const excludedCompaniedTextArea = document.getElementById(
    "excludedCompaniesTextArea"
  );

  excludedCompaniedTextArea.value =
    excludedCompaniesToString(excludedCompanies);
}

async function onClearAllExcludedCompaniesButtonClick() {
  await chrome.storage.local.remove(["excludedCompanies"]);
}

async function onExcludeCompanyButtonClick() {
  const companyToExclude = document.getElementById("excludeCompanyInput").value;
  const persistedExcludedCompanies = await getExcludedCompaniesFromStorage();
  persistedExcludedCompanies.add(companyToExclude);
  await setExcludedCompaniesToStorage(persistedExcludedCompanies);
}

async function getExcludedCompaniesFromStorage() {
  const { excludedCompanies } = await chrome.storage.local.get([
    "excludedCompanies",
  ]);

  return new Set(excludedCompanies ?? []);
}

async function setExcludedCompaniesToStorage(companies) {
  await chrome.storage.local.set({
    excludedCompanies: Array.from(companies),
  });
}

function excludedCompaniesToString(companies) {
  return Array.from(companies.values()).join("\n");
}
