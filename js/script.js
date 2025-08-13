document.addEventListener("DOMContentLoaded", () => {
    const typeEquipment = document.getElementById("type-equipment");
    const findingSelect = document.getElementById("finding");
    const saveButton = document.getElementById("save-data");
    const viewTableButton = document.getElementById("view-table");
    const locationSelect = document.getElementById("location");
    const addLocationButton = document.getElementById("add-location");
    const clearAllDataButton = document.getElementById("clear-all-data");
    const locations = []; // Array to store unique locations
    let formData = []; // Array to store form data
    let isEx = false; // Global variable to track if the location is Ex
    const confirmFindingsBtn = document.getElementById("confirmFindingsBtn");
    const uploadContainer = document.getElementById("uploadContainer");
    const botaoCarregar = document.getElementById('carregarBtn');
    
    let inspectionCount = 0;
    let listaEquipamentos = [];
    //const inspectionCounterDisplay = document.getElementById("inspection-counter");

    // Call these functions on page load
    loadLocations();
    loadFormDataFromLocalStorage();
    updateLocationDropdown();
    updateInspectionCount();
    carregarListaDoLocalStorage()
    updatePresetDisplay();

const tagInput = document.getElementById('tag-id');
const description = document.getElementById('Equipment-des');
const autocompleteList = document.getElementById('autocomplete-list');
const presetBtn = document.getElementById("preset-manage-btn");
const presetContainer = document.getElementById("preset-container");
const presetList = document.getElementById("preset-list");
const presetSaveBtn = document.getElementById("preset-save-btn");
const presetYes = document.getElementById("preset-yes");
const presetNo = document.getElementById("preset-no");
const presetSelect = document.getElementById("preset-list");
const displayPreset= document.getElementById("currentPresetValues");
let currentPreset = [];

// Location update
locationSelect.addEventListener("change", () => {
  localStorage.setItem("lastSelectedLocation", locationSelect.value);
});


// start hidden
presetContainer.style.display = "none";
// Listen to both Yes and No
presetNo.addEventListener("change", refreshPresetDisplay);
presetYes.addEventListener("change", refreshPresetDisplay);

// Run on page load
refreshPresetDisplay();

// Only open if "Yes"
presetBtn.addEventListener("click", () => {
    if (!presetYes.checked) {
        alert('Switch "Preset" to Yes to manage presets.');
        return;
    }
    // show + refresh list (or toggle if you prefer)
    updatePresetList(); // make sure this fills <select id="preset-list">
    presetContainer.style.display = "block";
});

function refreshPresetDisplay() {
    if (presetNo.checked) {
        presetContainer.style.display = "none";
        displayPreset.textContent = "None";
        return;
    }

    // Get preset for current equipment type (fallback to "Others")
    const eqType = (typeEquipment?.value || "Others").trim();
    // If you saved to localStorage:
    const list = loadPresetFromLS(eqType); // returns [] if none
    // Or, if you keep it in memory: const list = currentPreset;

    displayPreset.textContent = list.length ? list.join(", ") : "None";
}




// Save from <select multiple>
presetSaveBtn.addEventListener("click", () => {
  // read selected options
  currentPreset = Array.from(presetSelect.selectedOptions).map(opt => opt.value);

  // save per equipment type
  const eqType = "Others";
  savePresetToLS(eqType, currentPreset);

  alert("Preset saved: " + currentPreset.join(", "));
  presetContainer.style.display = "none";
});


// --- Load last choice ---
const savedPresetChoice = localStorage.getItem("presetChoice");
if (savedPresetChoice === "Yes") {
    presetYes.checked = true;
} else if (savedPresetChoice === "No") {
    presetNo.checked = true;
}

// --- Save choice when changed ---
[presetYes, presetNo].forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.checked) {
            localStorage.setItem("presetChoice", radio.value);
        }
    });
});



// ---- LocalStorage helpers ----
function savePresetToLS(type, list) {
  try {
    localStorage.setItem(`preset:${type}`, JSON.stringify(list || []));
  } catch (e) {
    console.error("Failed to save preset:", e);
  }
}

function loadPresetFromLS(type) {
  try {
    const raw = localStorage.getItem(`preset:${type}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load preset:", e);
    return [];
  }
}

function updatePresetList() {
    const findings = findingsData["Others"] || [];
    const presetSelect = document.getElementById("preset-list"); // <select id="preset-list" multiple>
    presetSelect.innerHTML = "";

    findings.forEach(finding => {
        const option = document.createElement("option");
        option.value = finding;
        option.textContent = finding;
        option.selected = currentPreset.includes(finding);
        presetSelect.appendChild(option);
    });
}


function updatePresetDisplay() {
    const eqType = (typeEquipment?.value || "Others").trim();
    const presetList = loadPresetFromLS(eqType); // or use currentPreset
    const display = document.getElementById("currentPresetValues");

    if (presetList.length > 0) {
        display.textContent = presetList.join(", ");
    } else {
        display.textContent = "None";
    }
}

// Call it after saving a preset
presetSaveBtn.addEventListener("click", () => {
    currentPreset = Array.from(presetSelect.selectedOptions).map(opt => opt.value);
    const eqType = (typeEquipment?.value || "Others").trim();
    savePresetToLS(eqType, currentPreset);

    updatePresetDisplay(); // refresh UI

    alert("Preset saved: " + currentPreset.join(", "));
    presetContainer.style.display = "none";
});

tagInput.addEventListener('input', function() {
    const inputValue = this.value.toUpperCase();
    closeAllLists();

    if (!inputValue) return;

    const matchedEquipamentos = listaEquipamentos.filter(equipamento =>
        equipamento.tag.toUpperCase().includes(inputValue)
    );

    if (matchedEquipamentos.length === 0) {
        const noMatchItem = document.createElement('div');
        noMatchItem.textContent = `TAG ${inputValue} não encontrada na lista.`;
        autocompleteList.appendChild(noMatchItem);
        return;
    }

    matchedEquipamentos.forEach(equipamento => {
        const item = document.createElement('div');
        item.innerHTML = `<strong>${equipamento.tag.substr(0, inputValue.length)}</strong>` +
                         equipamento.tag.substr(inputValue.length) +
                         ` - ${equipamento.descricao}`;
        
        item.addEventListener('click', function() {
            tagInput.value = equipamento.tag;
            description.value = equipamento.descricao;
            closeAllLists();
        });

        autocompleteList.appendChild(item);
    });
});

document.addEventListener('click', function(e) {
    if (e.target !== tagInput) {
        closeAllLists();
    }
});

function closeAllLists() {
    autocompleteList.innerHTML = '';
}


// --- 1. FUNÇÃO PARA CARREGAR A LISTA DO LOCALSTORAGE ---
// Esta função é chamada ao carregar a página
function carregarListaDoLocalStorage() {
    const equipamentosSalvos = localStorage.getItem('listaEquipamentos');
    if (equipamentosSalvos) {
        listaEquipamentos = JSON.parse(equipamentosSalvos);
        console.log('Lista de equipamentos carregada do localStorage.');
    }
}

// BOTÃO
botaoCarregar.addEventListener('click', carregarArquivoCSV);

function carregarArquivoCSV() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;

  if (!file) {
    alert('Por favor, selecione um arquivo CSV para carregar.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      // 1) Texto cru + remove BOM
      const raw = (e.target.result || '').replace(/^\uFEFF/, '');

      // 2) Quebra de linhas robusta e ignora linhas vazias
      const linhas = raw.split(/\r?\n/).filter(l => l.trim() !== '');
      if (linhas.length < 2) {
        alert('Arquivo CSV vazio ou com poucas linhas.');
        return;
      }

      // 3) Detecta delimitador (vírgula ou ponto-e-vírgula)
      const guessDelimiter = (s) => {
        const c = (pat) => (s.match(pat) || []).length;
        return c(/;/g) > c(/,/g) ? ';' : ',';
      };
      const delimiter = guessDelimiter(linhas[0]);

      // 4) Normaliza cabeçalhos (minúsculas, sem acentos, trim)
      const normalizeField = (s) => s
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .trim();

      const cabecalhoOriginal = linhas[0].split(delimiter).map(h => h.trim());
      const cabecalho = cabecalhoOriginal.map(normalizeField);

      // 5) Verifica colunas esperadas ("tag" e "descricao")
      if (!cabecalho.includes('tag') || !cabecalho.includes('descricao')) {
        alert(
          'O CSV deve conter as colunas "tag" e "descricao" no cabeçalho.\n' +
          'Detectei: ' + cabecalhoOriginal.join(' | ')
        );
        return;
      }

      // 6) Constrói objetos por linha
      const idxTag = cabecalho.indexOf('tag');
      const idxDesc = cabecalho.indexOf('descricao');

      const novaLista = [];
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        // divide por delimitador (simples; se precisar lidar com campos entre aspas, dá pra melhorar)
        const dados = linha.split(delimiter).map(d => d.trim());
        if (dados.length !== cabecalho.length) {
          // pula linhas quebradas/incompletas
          continue;
        }

        const item = {};
        for (let j = 0; j < cabecalho.length; j++) {
          item[cabecalho[j]] = dados[j];
        }

        // garante chaves legíveis também em pt
        item.tag = item.tag ?? dados[idxTag] ?? '';
        item.descricao = item.descricao ?? dados[idxDesc] ?? '';

        // ignora linhas totalmente vazias
        if ((item.tag || item.descricao)) {
          novaLista.push(item);
        }
      }

      // 7) Salva
      listaEquipamentos = novaLista;
      localStorage.setItem('listaEquipamentos', JSON.stringify(listaEquipamentos));

      alert(`Lista de equipamentos carregada com sucesso! Itens: ${listaEquipamentos.length}`);
      console.log('Nova lista de equipamentos salva no localStorage.', listaEquipamentos);
    } catch (err) {
      console.error('Erro ao processar CSV:', err);
      alert('Houve um erro ao processar o CSV. Veja o console para detalhes.');
    }
  };

  // UTF-8 funciona melhor em mobile
  reader.readAsText(file, 'UTF-8');
}



function updateInspectionCount() {
        const inspectionCounterDisplay = document.getElementById("inspection-counter");
        inspectionCounterDisplay.textContent = formData.length;
    }


    // Findings Data
    const baseFindings = ["ID TAG", "Cable Tag", "Grounding", "Warning Sign", "External Condition","Accessible","Others"];
    const findingsData = {
        "Junction Box": [...baseFindings],
        "Panel": [...baseFindings, "ON/OFF Stickers", "Live Parts Protected", "Indication Light Colour"],
        "Motor": [...baseFindings, "Rotative Parts Covered", "Direction of Rotation Arrow"],
        "Power Outlet": [...baseFindings, "ON/OFF Stickers"],
        "Command Switch": [...baseFindings, "ON/OFF Stickers"],
        "Environment Conditions": ["Isolation Mats","House Keeping","Electrical Room used for Storage", "Doors Entry Sign", "Cable Trays Covered", "Hazardous Area Signal"],
        "Others": [...baseFindings, "ON/OFF Stickers", "Live Parts Protected", "Indication Light Colour", "Direction of Rotation Arrow"]
    };

    // Update location dropdown
    function updateLocationDropdown() {
        const lastLocationRaw = localStorage.getItem("locations");
        const locations = lastLocationRaw ? JSON.parse(lastLocationRaw) : [];

        locationSelect.innerHTML = `<option value="">--Select Location--</option>`;

        // Get the last selected location from storage (not last added)
        const storedSelection = localStorage.getItem("lastSelectedLocation") || "";
        const lastSelectedLocationName =
            storedSelection && locations.some(l => l.name === storedSelection)
                ? storedSelection
                : (locations.length > 0 ? locations[0].name : ""); // fallback

        // Fill dropdown
        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location.name;
            option.textContent = location.name + (location.isEx ? " (Ex)" : "");
            if (location.name === lastSelectedLocationName) {
                option.selected = true;
            }
            locationSelect.appendChild(option);
        });

        // Set radio buttons based on this location
        setExAreaRadios(lastSelectedLocationName, locations);
    }

    // Centralized function to set and lock Ex Area radios
    function setExAreaRadios(selectedName, locations) {
        const selectedLocationObj = locations.find(loc => loc.name === selectedName);
        const isEx = selectedLocationObj ? selectedLocationObj.isEx : false;

        const yesRadio = document.querySelector('input[name="exArea"][value="yes"]');
        const noRadio = document.querySelector('input[name="exArea"][value="no"]');

        if (yesRadio && noRadio) {
            yesRadio.checked = isEx;
            noRadio.checked = !isEx;
            yesRadio.disabled = true;
            noRadio.disabled = true;
        }
    }

    // Handle location changes
    locationSelect.addEventListener("change", () => {
        const selectedLocation = locationSelect.value;

        // Save to localStorage
        if (selectedLocation) {
            localStorage.setItem("lastSelectedLocation", selectedLocation);
        }

        // Load locations list and update radios
        const lastLocationRaw = localStorage.getItem("locations");
        const locations = lastLocationRaw ? JSON.parse(lastLocationRaw) : [];

        setExAreaRadios(selectedLocation, locations);
    });

    // Add a new location
    addLocationButton.addEventListener("click", () => {
        const newLocation = prompt("Please enter a new location:");
        const trimmedLocation = newLocation ? newLocation.trim() : "";
    
        if (!trimmedLocation) {
            alert("Invalid location name.");
            return;
        }
    
        // Check if location already exists
        const alreadyExists = locations.some(loc => loc.name === trimmedLocation);
        if (alreadyExists) {
            alert("This location already exists.");
            return;
        }
    
        const confirmEx = confirm(`Is "${trimmedLocation}" an Ex location? (Select Cancel for no)`);
        const newLocObj = { name: trimmedLocation, isEx: confirmEx };
    
        locations.push(newLocObj);
        saveLocations();
        updateLocationDropdown();
        alert(`Location "${trimmedLocation}" added successfully.${confirmEx ? ' Marked as Ex.' : ''}`);
    });
    
    

    // Save locations to localStorage
    function saveLocations() {
        localStorage.setItem("locations", JSON.stringify(locations));
    }

    // Load locations from localStorage
    function loadLocations() {
        const savedLocations = JSON.parse(localStorage.getItem("locations")) || [];
        locations.push(...savedLocations);
    }

    // Load formData from localStorage
    function loadFormDataFromLocalStorage() {
        formData = JSON.parse(localStorage.getItem("formData")) || [];
    }

    // Populate findings dropdown dynamically
function updateFindingsDropdown(reset = false) {
    const selectedType = typeEquipment.value;
    findingSelect.innerHTML = "";

    const complianceElement = document.querySelector('input[name="compliance"]:checked');
    const compliance = complianceElement ? complianceElement.value : null;

    if (compliance === "Yes") {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No findings";
        option.disabled = true;
        //if (reset) option.selected = true;
        //findingSelect.appendChild(option);
    } else {
        if (reset) {
            //const placeholderOption = document.createElement("option");
            //placeholderOption.value = "";
            //placeholderOption.textContent = "-- Select finding --";
           // placeholderOption.disabled = true;
            //placeholderOption.selected = true;
            //findingSelect.appendChild(placeholderOption);
        }

        const findings = findingsData[selectedType] || [];
        findings.forEach(finding => {
            const option = document.createElement("option");
            option.value = finding;
            option.textContent = finding;
            findingSelect.appendChild(option);
        });
    }
}


// assumes:
// let currentPreset = []; // managed elsewhere
// findingSelect, confirmFindingsBtn, uploadContainer, locationSelect exist

confirmFindingsBtn.addEventListener("click", () => {
    const usePreset = document.querySelector('input[name="preset"]:checked')?.value === "Yes";
    const manualSelected = Array.from(findingSelect.selectedOptions).map(opt => opt.value);
    const fromPreset = usePreset ? loadPresetFromLS("Others") : [];
    
    // Combine & dedupe (keep order: preset first, then manual)
    const selectedFindings = [...new Set([...fromPreset, ...manualSelected])];

    if (selectedFindings.length === 0) {
        alert("Please select at least one finding or define a preset.");
        return;
    }

    // (optional) reflect combined selection in the UI so user sees what's used
    Array.from(findingSelect.options).forEach(opt => {
        opt.selected = selectedFindings.includes(opt.value);
    });

    findingSelect.disabled = true;
    confirmFindingsBtn.disabled = true;
    uploadContainer.innerHTML = "";

    selectedFindings.forEach((finding, index) => {
        const label = document.createElement("label");
        label.textContent = `Upload image for: ${finding}`;
        label.setAttribute("for", `upload-${index}`);

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.setAttribute("capture", "environment");
        input.id = `upload-${index}`;
        input.name = `upload-${index}`;
        input.dataset.finding = finding;

        input.addEventListener("change", async () => {
            const file = input.files[0];
            const findingPart = input.dataset.finding.replace(/\s+/g, "_");
            const typeEquipment = document.getElementById("type-equipment").value.trim();
            const location = locationSelect.value.trim();
            const tagId = document.getElementById("tag-id").value.trim();

            if (!typeEquipment || !location || !tagId) {
                alert("Please fill in all fields before uploading images.");
                return;
            }
            if (!file) {
                alert(`Please upload an image for: ${findingPart}`);
                return;
            }

            // keep original extension if possible
            const origName = file.name || "";
            const ext = (origName.lastIndexOf(".") !== -1) ? origName.slice(origName.lastIndexOf(".")) : ".jpg";
            const newFileName = `${findingPart}_${tagId}_${typeEquipment}_${location}${ext}`;

            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = newFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        const div = document.createElement("div");
        div.style.marginTop = "10px";
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
        div.appendChild(input);

        uploadContainer.appendChild(div);
    });
});


    
    // Event listeners for dropdown updates
    typeEquipment.addEventListener("change", updateFindingsDropdown);
    document.querySelectorAll('input[name="compliance"]').forEach(radio => {
        radio.addEventListener("change", updateFindingsDropdown);
    });

   // Save form data
   saveButton.addEventListener("click", () => {
    const selectedType = typeEquipment.value;
    const locationName = locationSelect.value.trim();
    const description = document.getElementById("Equipment-des").value.trim();

    const tagId = document.getElementById("tag-id").value.trim();
    const remarks = document.getElementById("remarks").value.trim();
    const complianceElement = document.querySelector('input[name="compliance"]:checked');
    const compliance = complianceElement ? complianceElement.value : null;
    const selectedFindings = Array.from(findingSelect.selectedOptions).map(option => option.value);

    const resistanceReading = document.getElementById("res_operator").value; // "<1" or ">1"
    const currentReading = document.getElementById("cur_operator").value;     // "<15" or ">15"

    // ✅ Get Ex value from radio button
    const yesRadio = document.querySelector('input[name="exArea"][value="yes"]');
    const isEx = yesRadio ? yesRadio.checked : false;
    let errorMessage = "Please fix the following issues:";

    // Primeiro, verifica se é "No" e não há findings
    if (compliance && compliance.toLowerCase() === "no" && selectedFindings.length === 0) {
        errorMessage += "\n- At least one finding is required if compliance is No.";
        alert(errorMessage);

    // Depois, verifica os campos obrigatórios
    } else if (!tagId || !locationName || !selectedType || !compliance) {
        if (!tagId) errorMessage += "\n- TAG/ID Number is required.";
        if (!locationName) errorMessage += "\n- Location is required.";
        if (!selectedType) errorMessage += "\n- Type of equipment is required.";
        if (!compliance) errorMessage += "\n- Select Yes or No for Compliance.";
        alert(errorMessage);

    // Se passar por todas as validações, salva os dados
    } else {
        formData.push({
            typeEquipment: selectedType,
            location: locationName,
            isExArea: isEx,
            tagId,
            Description: description,
            remarks,
            compliance,
            findings: selectedFindings,
            resistance: resistanceReading,
            current: currentReading
        });

        saveFormDataToLocalStorage();

        // Clear fields
        //findingSelect.innerHTML = "";
        document.getElementById("tag-id").value = "";
        document.getElementById("type-equipment").value = "";
        updateLocationDropdown();
        updateFindingsDropdown(true);
        findingSelect.disabled = false;
        confirmFindingsBtn.disabled = false;
        //inspectionCount++;
        //inspectionCounterDisplay.textContent = inspectionCount;
        updateInspectionCount()

        alert("Data saved");
    }

});


    // Save formData to localStorage
    function saveFormDataToLocalStorage() {
        localStorage.setItem("formData", JSON.stringify(formData));
        //loadIdMapsFromLocalStorage();
    }



    window.onload = () => {
         const viewTableButton = document.getElementById("view-table");

        if (viewTableButton) {
            viewTableButton.addEventListener("click", () => {
                window.open("popup.html", "Saved Data", "width=1000,height=600");
            });
        } else {
            console.error("Botão 'viewTableButton' não encontrado no DOM.");
        }
    };

    
    
    // Clear all data from localStorage
    clearAllDataButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all saved data?")) {
            localStorage.clear();
            locations.length = 0;
            formData = [];
            updateLocationDropdown();
            alert("All saved data has been cleared.");
        }
    });


        document.getElementById("uploadBtn").addEventListener("change", async function (event) {
            const files = event.target.files;
            if (!files.length) return;
        
            // Ensure correct ID references
            const typeEquipment = document.getElementById("type-equipment").value.trim();
            const location = locationSelect.value.trim();
            const tagId = document.getElementById("tag-id").value.trim();
            const selectedFindings = Array.from(findingSelect.selectedOptions).map(option => option.value);
            //let findingsPart = selectedFindings.length > 0 ? selectedFindings.join("_") : "NoFindings";
            let findingsPart = selectedFindings.join("_") ;
            // Check if the "Yes" option for General Picture is selected
            //const generalPic = document.querySelector('input[name="general"]:checked')?.value === "Yes";    
            
            

            if (!typeEquipment || !location || !tagId) {
                alert("Please fill in all fields before uploading images.");
                return;
            }
            const newFileName = `${findingsPart}_${tagId}_${typeEquipment}_${location}.png`;
            for (const file of files) {
    
                //const newFileName = `${findingsPart}_${tagId}_${typeEquipment}_${location}.png`;

               // const newFileName = `${allFindings.filter(finding => row.findings.includes(finding)).join("_")}_${tagId}_${typeEquipment}_${location}.png`;
        
                // Read file as blob
                const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        
                // Create download link
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = newFileName;
        
                // Append to body and trigger download
                document.body.appendChild(link);
                link.click();
        
                // Remove link after download
                document.body.removeChild(link);
            }
        
        
            //alert("Images saved successfully! Check your downloads folder.");
            document.getElementById("uploadBtn").value = ""; // Clears file selection
        });
        
    function generateRandomData() {
        const types = ["Junction Box", "Panel", "Motor", "Power Outlet", "Command Switch","Others"];
        const locations = ["Room 101", "Basement", "Main Hall", "Engine Room"];
        //const findings = ["ID TAG", "Cable Tag", "Grounding", "Warning Sign", "Exterior Damage"];
        const findings =["ID TAG", "Cable Tag", "Grounding", "Warning Sign", "Exterior Damage","ON/OFF Stickers", "Live Parts Protected", "Indication Light Colour", "Direction of Rotation Arrow"];
        
    
        const typeEquipment = types[Math.floor(Math.random() * types.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const tagId = `TAG-${Math.floor(Math.random() * 10000)}`;
        const remarks = `remarks-${Math.floor(Math.random() * 10000)}`;
        const compliance = Math.random() > 0.5 ? "Yes" : "No";
        const selectedFindings = findings.slice(0, Math.floor(Math.random() * findings.length + 1));
    /*
        console.log(`Generated Data: 
            Type of Equipment: ${typeEquipment}, 
            Location: ${location}, 
            TAG/ID: ${tagId}, 
            Remarks: ${remarks}, 
            Compliance: ${compliance}, 
            Findings: ${selectedFindings.join(", ")}
        `);
    */
        return {
            typeEquipment,
            location,
            tagId,
            remarks,
            compliance,
            findings: selectedFindings
        };
    }
    

// Function to populate formData with test items
function populateFormData(count = 1000) {
    for (let i = 0; i < count; i++) {
        const newRow = generateRandomData();
        formData.push(newRow);
    }
    saveFormDataToLocalStorage(); // Save to localStorage
    console.log(`${count} test items added to formData.`);
    alert(`${count} test items added successfully!`);
}

// Function to simulate form submissions
function simulateFormSubmission(count = 1000) {
    for (let i = 0; i < count; i++) {
        const randomData = generateRandomData();

        // Simulate filling the form
        document.getElementById("type-equipment").value = randomData.typeEquipment;
        document.getElementById("location").value = randomData.location;
        document.getElementById("tag-id").value = randomData.tagId;
        document.getElementById("remarks").value = randomData.remarks;
        document.querySelector(`input[name="compliance"][value="${randomData.compliance}"]`).checked = true;
        updateFindingsDropdown();
        selectFindings(randomData.findings);

        // Simulate clicking the save button
        saveButton.click();
    }

    console.log(`${count} simulated form submissions completed.`);
    alert(`${count} simulated form submissions completed!`);
}


// Select findings
function selectFindings(findings) {
    // Ensure findingSelect is updated before selecting
    updateFindingsDropdown(); // Ensure this updates `findingSelect` based on `typeEquipment`

    findings.forEach(finding => {
        const option = Array.from(findingSelect.options).find(opt => opt.value === finding);
        if (option) option.selected = true; // Mark the option as selected
    });
}


//simulateFormSubmission(1000)
//generateRandomData()

    
});



