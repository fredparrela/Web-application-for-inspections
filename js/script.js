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

const tagInput = document.getElementById('tag-id');
const description = document.getElementById('Equipment-des');
const autocompleteList = document.getElementById('autocomplete-list');

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

// --- 2. FUNÇÃO PARA PROCESSAR O ARQUIVO CSV ---
// Esta função é chamada pelo botão de upload
botaoCarregar.addEventListener('click', carregarArquivoCSV);
function carregarArquivoCSV() {
        const file = document.getElementById('csvFile').files[0];
        alert('Okay');
        if (!file) {
            alert('Por favor, selecione um arquivo CSV para carregar.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const linhas = text.split('\n');
            
            const novaLista = [];
            const cabecalho = linhas[0].split(',').map(h => h.trim()); // Pega o cabeçalho
            alert(cabecalho);
            // Verifica se o cabeçalho tem as colunas esperadas
            if (!cabecalho.includes('tag') || !cabecalho.includes('descricao')) {
                alert('The CSV file should contain the columns "tag", "description".');
                return;
            }

            for (let i = 1; i < linhas.length; i++) {
                const dados = linhas[i].split(',').map(d => d.trim());
                if (dados.length === cabecalho.length) {
                    const equipamento = {};
                    for (let j = 0; j < cabecalho.length; j++) {
                        equipamento[cabecalho[j]] = dados[j];
                    }
                    novaLista.push(equipamento);
                }
            }
            listaEquipamentos = novaLista;
            localStorage.setItem('listaEquipamentos', JSON.stringify(listaEquipamentos));
            alert('Lista de equipamentos carregada com sucesso!');
            console.log('Nova lista de equipamentos salva no localStorage.');
        };
        reader.readAsText(file);
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
    // update location dropdown 
    function updateLocationDropdown() {
        const lastLocationRaw = localStorage.getItem("locations");
        const locations = lastLocationRaw ? JSON.parse(lastLocationRaw) : [];
    
        locationSelect.innerHTML = `<option value="">--Select Location--</option>`;
    
        // Get the last selected location name (optional)
        const lastSelectedLocationName = locations.length > 0 ? locations[locations.length - 1].name : "";
    
        // Fill the dropdown
        locations.forEach(location => {
            const option = document.createElement("option");
            option.value = location.name;
            option.textContent = location.name + (location.isEx ? " (Ex)" : "");
            if (location.name === lastSelectedLocationName) {
                option.selected = true;
            }
            locationSelect.appendChild(option);
        });
    
        // Find the selected location object
        const selectedLocationObj = locations.find(loc => loc.name === lastSelectedLocationName);
        const isEx = selectedLocationObj ? selectedLocationObj.isEx : false;
    
       // console.log("Last selected location name:", lastSelectedLocationName);
       // console.log("isEx:", isEx);
    
        // Set and lock the radio buttons
        const yesRadio = document.querySelector('input[name="exArea"][value="yes"]');
        const noRadio = document.querySelector('input[name="exArea"][value="no"]');
        if (yesRadio && noRadio) {
            yesRadio.checked = isEx;
            noRadio.checked = !isEx;
            yesRadio.disabled = true;
            noRadio.disabled = true;
        }
    }
    // Location select 
    locationSelect.addEventListener("change", () => {
        const selectedName = locationSelect.value;
    
        const lastLocationRaw = localStorage.getItem("locations");
        const locations = lastLocationRaw ? JSON.parse(lastLocationRaw) : [];
    
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
    
        //console.log(`Selected location: ${selectedName} | Ex Area: ${isEx}`);
    });
    

    // Save the selected location to localStorage
    locationSelect.addEventListener("change", () => {
        const selectedLocation = locationSelect.value;
        if (selectedLocation) {
            localStorage.setItem("lastSelectedLocation", selectedLocation);
        }
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

    
    confirmFindingsBtn.addEventListener("click", () => {
        findingSelect.disabled = true;
        confirmFindingsBtn.disabled = true;
        uploadContainer.innerHTML = "";
    
        const selectedFindings = Array.from(findingSelect.selectedOptions).map(option => option.value);
    
        selectedFindings.forEach((finding, index) => {
            const label = document.createElement("label");
            label.textContent = `Upload image for: ${finding}`;
            label.setAttribute("for", `upload-${index}`);
    
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.setAttribute("capture", "environment");  // ✅ enforce correct behavior
            input.id = `upload-${index}`;
            input.name = `upload-${index}`;
            input.dataset.finding = finding; // 👈 save finding as a custom attribute
    
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
    
                const newFileName = `${findingPart}_${tagId}_${typeEquipment}_${location}.png`;
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

    if (!tagId || !locationName || !selectedType || !compliance) {
        let errorMessage = "Please fix the following issues:";
        if (!tagId) errorMessage += "\n- TAG/ID Number is required.";
        if (!locationName) errorMessage += "\n- Location is required.";
        if (!selectedType) errorMessage += "\n- Type of equipment is required.";
        if (!compliance) errorMessage += "\n- Select Yes or No for Compliance.";
        alert(errorMessage);
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



