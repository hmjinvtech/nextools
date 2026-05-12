// Tools JavaScript - Text, Unit, Color, QR, Image tools

// Switch between main tabs (PDF, Tools)
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
}

// Switch between tools
function switchTool(toolName) {
    document.querySelectorAll('.pdf-tool').forEach(tool => {
        tool.classList.remove('active');
    });
    document.getElementById(toolName).classList.add('active');

    document.querySelectorAll('.tool-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ===== TEXT TOOLS =====
const textInput = document.getElementById('textInput');
if (textInput) {
    textInput.addEventListener('input', updateTextStats);
}

function updateTextStats() {
    const text = document.getElementById('textInput').value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const spaces = (text.match(/ /g) || []).length;
    
    document.getElementById('textStats').innerHTML = 
        `Words: ${words} | Characters: ${characters} | Spaces: ${spaces}`;
}

function convertToUpperCase() {
    const text = document.getElementById('textInput').value;
    document.getElementById('textInput').value = text.toUpperCase();
    updateTextStats();
}

function convertToLowerCase() {
    const text = document.getElementById('textInput').value;
    document.getElementById('textInput').value = text.toLowerCase();
    updateTextStats();
}

function capitalizeText() {
    const text = document.getElementById('textInput').value;
    const capitalized = text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    document.getElementById('textInput').value = capitalized;
    updateTextStats();
}

function reverseText() {
    const text = document.getElementById('textInput').value;
    document.getElementById('textInput').value = text.split('').reverse().join('');
    updateTextStats();
}

// ===== UNIT CONVERTER =====
const unitCategories = {
    length: {
        units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
        multipliers: [1, 0.001, 100, 1000, 0.000621371, 1.09361, 3.28084, 39.3701]
    },
    weight: {
        units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
        multipliers: [1, 1000, 1000000, 2.20462, 35.274, 0.001]
    },
    temperature: {
        units: ['Celsius', 'Fahrenheit', 'Kelvin'],
        multipliers: [1, 1, 1]
    },
    volume: {
        units: ['Liter', 'Milliliter', 'Gallon', 'Quart', 'Pint', 'Cup'],
        multipliers: [1, 1000, 0.264172, 1.05669, 2.11338, 4.22675]
    }
};

function updateUnitCategories() {
    const type = document.getElementById('unitType').value;
    const category = unitCategories[type];
    
    const fromSelect = document.getElementById('fromUnit');
    const toSelect = document.getElementById('toUnit');
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    category.units.forEach(unit => {
        fromSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
        toSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
    });
    
    if (toSelect.options.length > 1) {
        toSelect.selectedIndex = 1;
    }
}

function convertUnits() {
    const type = document.getElementById('unitType').value;
    const fromValue = parseFloat(document.getElementById('fromValue').value);
    const fromUnit = document.getElementById('fromUnit').value;
    const toUnit = document.getElementById('toUnit').value;
    
    if (isNaN(fromValue)) {
        alert('Please enter a valid number');
        return;
    }
    
    const category = unitCategories[type];
    const fromIndex = category.units.indexOf(fromUnit);
    const toIndex = category.units.indexOf(toUnit);
    
    let result;
    
    if (type === 'temperature') {
        result = convertTemperature(fromValue, fromUnit, toUnit);
    } else {
        const baseValue = fromValue / category.multipliers[fromIndex];
        result = baseValue * category.multipliers[toIndex];
    }
    
    document.getElementById('toValue').value = result.toFixed(6);
}

function convertTemperature(value, from, to) {
    let celsius;
    
    if (from === 'Celsius') celsius = value;
    else if (from === 'Fahrenheit') celsius = (value - 32) * 5/9;
    else if (from === 'Kelvin') celsius = value - 273.15;
    
    if (to === 'Celsius') return celsius;
    else if (to === 'Fahrenheit') return celsius * 9/5 + 32;
    else if (to === 'Kelvin') return celsius + 273.15;
}

updateUnitCategories();

// ===== COLOR CONVERTER =====
function convertHexToRgb() {
    const hex = document.getElementById('hexInput').value;
    
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
        alert('Please enter a valid HEX color (e.g., #FF5733)');
        return;
    }
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    document.getElementById('redValue').value = r;
    document.getElementById('greenValue').value = g;
    document.getElementById('blueValue').value = b;
    
    updateColorPreview();
}

function convertRgbToHex() {
    const r = parseInt(document.getElementById('redValue').value);
    const g = parseInt(document.getElementById('greenValue').value);
    const b = parseInt(document.getElementById('blueValue').value);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        alert('Please enter valid RGB values (0-255)');
        return;
    }
    
    const hex = '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
    
    document.getElementById('hexInput').value = hex;
    updateColorPreview();
}

function updateColorPreview() {
    const r = parseInt(document.getElementById('redValue').value) || 255;
    const g = parseInt(document.getElementById('greenValue').value) || 255;
    const b = parseInt(document.getElementById('blueValue').value) || 255;
    
    const hex = '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
    
    document.getElementById('colorPreview').style.backgroundColor = hex;
    document.getElementById('colorValues').innerHTML = 
        `HEX: ${hex} | RGB: (${r}, ${g}, ${b})`;
}

// ===== COLOR IDENTIFIER =====
function loadImageForColorIdentifier(event) {
    const file = event.target.files[0];
    if (file && file.size <= 200 * 1024 * 1024) {
        const url = URL.createObjectURL(file);
        document.getElementById('colorImg').src = url;
        document.getElementById('colorImagePreview').style.display = 'flex';
    } else {
        alert('File exceeds 200MB limit');
        event.target.value = '';
    }
}

function identifyColors() {
    const img = document.getElementById('colorImg');
    if (!img.src) {
        alert('Please upload an image first');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const colorMap = {};
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hex = '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
        
        colorMap[hex] = (colorMap[hex] || 0) + 1;
    }
    
    const sortedColors = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = '';
    
    sortedColors.forEach(([hex]) => {
        const div = document.createElement('div');
        div.style.cssText = `
            width: 100%;
            height: 60px;
            background: ${hex};
            border-radius: 8px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            font-weight: 700;
            font-size: 12px;
            color: ${getContrastColor(hex)};
            cursor: pointer;
            border: 2px solid #2a2219;
        `;
        div.textContent = hex;
        div.onclick = () => {
            document.getElementById('hexInput').value = hex;
            convertHexToRgb();
        };
        palette.appendChild(div);
    });
}

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#FFFFFF';
}

// ===== QR CODE GENERATOR =====
let qrInstance = null;

function generateQRCode() {
    const text = document.getElementById('qrInput').value;
    
    if (!text) {
        alert('Please enter text or URL');
        return;
    }
    
    const preview = document.getElementById('qrPreview');
    preview.innerHTML = '';
    
    qrInstance = new QRCode(preview, {
        text: text,
        width: 250,
        height: 250,
        colorDark: '#d4a574',
        colorLight: '#0a0a0a',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    document.getElementById('downloadQR').style.display = 'block';
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrPreview canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
    }
}

// ===== IMAGE COMPRESSOR =====
const qualitySlider = document.getElementById('qualitySlider');
if (qualitySlider) {
    qualitySlider.addEventListener('input', function() {
        document.getElementById('qualityValue').textContent = this.value;
    });
}

function loadImageForCompress(event) {
    const file = event.target.files[0];
    if (file && file.size <= 200 * 1024 * 1024) {
        const url = URL.createObjectURL(file);
        document.getElementById('compressImg').src = url;
        document.getElementById('compressImagePreview').style.display = 'flex';
        document.getElementById('origSize').textContent = (file.size / 1024 / 1024).toFixed(2);
    } else {
        alert('File exceeds 200MB limit');
        event.target.value = '';
    }
}

function compressImage() {
    const img = document.getElementById('compressImg');
    if (!img.src) {
        alert('Please upload an image first');
        return;
    }

    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob(function(blob) {
        const compressedSize = (blob.size / 1024 / 1024).toFixed(2);
        document.getElementById('compSize').textContent = compressedSize;
        document.getElementById('compressStats').style.display = 'block';
        
        downloadFile(blob, `compressed-image-${new Date().getTime()}.png`);
    }, 'image/png', quality);
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}