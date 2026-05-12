// Tab Navigation
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
}

// Calculator Variables
let display = document.getElementById('display');
let currentInput = '0';
let operator = null;
let previousValue = null;
let shouldResetDisplay = false;
let memory = 0;
let isDegrees = true;
let isScientificMode = false;

function updateDisplay() {
    display.value = currentInput;
}

function showBasic() {
    isScientificMode = false;
    document.getElementById('scientificPanel').style.display = 'none';
    document.getElementById('basicBtn').classList.add('active');
    document.getElementById('scientificBtn').classList.remove('active');
    updateModeIndicator();
}

function showScientific() {
    isScientificMode = true;
    document.getElementById('scientificPanel').style.display = 'block';
    document.getElementById('scientificBtn').classList.add('active');
    document.getElementById('basicBtn').classList.remove('active');
    updateModeIndicator();
}

function updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    if (isScientificMode) {
        indicator.textContent = isDegrees ? '[ Degrees ]' : '[ Radians ]';
    } else {
        indicator.textContent = '';
    }
}

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && num !== '.') {
            currentInput = num;
        } else if (num === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousValue = parseFloat(currentInput);
    operator = op;
    shouldResetDisplay = true;
}

function appendFunction(func) {
    const value = parseFloat(currentInput);
    let result;

    try {
        switch (func) {
            case 'sin':
                result = isDegrees ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                break;
            case 'cos':
                result = isDegrees ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                break;
            case 'tan':
                result = isDegrees ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                break;
            case 'asin':
                result = isDegrees ? Math.asin(value) * 180 / Math.PI : Math.asin(value);
                break;
            case 'acos':
                result = isDegrees ? Math.acos(value) * 180 / Math.PI : Math.acos(value);
                break;
            case 'atan':
                result = isDegrees ? Math.atan(value) * 180 / Math.PI : Math.atan(value);
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'cbrt':
                result = Math.cbrt(value);
                break;
            case '!':
                result = factorial(Math.floor(value));
                break;
            default:
                return;
        }
        currentInput = result.toString();
        shouldResetDisplay = true;
        updateDisplay();
    } catch (e) {
        currentInput = 'Error';
        updateDisplay();
    }
}

function appendConstant(constant) {
    if (constant === 'pi') {
        currentInput = Math.PI.toString();
    } else if (constant === 'e') {
        currentInput = Math.E.toString();
    }
    shouldResetDisplay = true;
    updateDisplay();
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function toggleSign() {
    const value = parseFloat(currentInput);
    currentInput = (-value).toString();
    updateDisplay();
}

function toggleDegRad() {
    isDegrees = !isDegrees;
    document.getElementById('degRadBtn').textContent = isDegrees ? 'DEG' : 'RAD';
    updateModeIndicator();
}

function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    currentInput = memory.toString();
    shouldResetDisplay = true;
    updateDisplay();
}

function memoryAdd() {
    memory += parseFloat(currentInput);
    shouldResetDisplay = true;
}

function memorySub() {
    memory -= parseFloat(currentInput);
    shouldResetDisplay = true;
}

function calculate() {
    if (operator === null || previousValue === null) {
        return;
    }

    const current = parseFloat(currentInput);
    let result;

    switch (operator) {
        case '+':
            result = previousValue + current;
            break;
        case '-':
            result = previousValue - current;
            break;
        case '*':
            result = previousValue * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error: Division by 0';
                updateDisplay();
                operator = null;
                previousValue = null;
                shouldResetDisplay = true;
                return;
            }
            result = previousValue / current;
            break;
        case '^':
            result = Math.pow(previousValue, current);
            break;
        default:
            return;
    }

    currentInput = result.toString();
    operator = null;
    previousValue = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    operator = null;
    previousValue = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length === 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (e.key === '+' || e.key === '-') {
        appendOperator(e.key);
    } else if (e.key === '*') {
        e.preventDefault();
        appendOperator('*');
    } else if (e.key === '/') {
        e.preventDefault();
        appendOperator('/');
    } else if (e.key === '^') {
        e.preventDefault();
        appendOperator('^');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    } else if (e.key === 'Escape') {
        clearDisplay();
    }
});

updateDisplay();
