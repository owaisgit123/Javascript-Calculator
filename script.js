// Loading Screen Management
const loadingScreen = document.getElementById('loadingScreen');
const calculatorApp = document.getElementById('calculatorApp');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Calculator State
let display = document.getElementById('display');
let displayLoading = document.getElementById('displayLoading');
let currentInput = '0';
let previousInput = null;
let operator = null;
let waitingForOperand = false;

// Loading Steps
const loadingSteps = [
    { text: "Initializing...", duration: 800 },
    { text: "Loading Components...", duration: 600 },
    { text: "Setting up Display...", duration: 500 },
    { text: "Configuring Buttons...", duration: 400 },
    { text: "Finalizing...", duration: 300 }
];

// Start Loading Process
function startLoading() {
    let currentStep = 0;
    let progress = 0;
    
    function nextStep() {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            document.querySelector('.loading-subtitle').textContent = step.text;
            
            const stepProgress = (currentStep + 1) / loadingSteps.length * 100;
            
            // Animate progress
            const progressInterval = setInterval(() => {
                progress += 2;
                if (progress >= stepProgress) {
                    progress = stepProgress;
                    clearInterval(progressInterval);
                    
                    progressFill.style.width = progress + '%';
                    progressText.textContent = Math.round(progress) + '%';
                    
                    currentStep++;
                    
                    if (currentStep < loadingSteps.length) {
                        setTimeout(nextStep, 200);
                    } else {
                        setTimeout(finishLoading, 500);
                    }
                } else {
                    progressFill.style.width = progress + '%';
                    progressText.textContent = Math.round(progress) + '%';
                }
            }, step.duration / 50);
        }
    }
    
    setTimeout(nextStep, 500);
}

function finishLoading() {
    document.querySelector('.loading-subtitle').textContent = "Ready!";
    
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            calculatorApp.classList.add('show');
            document.body.style.overflow = 'auto';
            
            // Animate buttons entrance
            animateButtonsEntrance();
        }, 600);
    }, 300);
}

function animateButtonsEntrance() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px) scale(0.9)';
        
        setTimeout(() => {
            button.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0) scale(1)';
        }, index * 50);
    });
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
let isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.querySelector('.toggle-icon').textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.querySelector('.toggle-icon').textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.querySelector('.toggle-icon').textContent = '🌙';
    }
    
    localStorage.setItem('darkMode', isDarkMode);
    
    // Theme change animation
    const calculator = document.querySelector('.calculator');
    calculator.style.transform = 'scale(0.95) rotateY(5deg)';
    setTimeout(() => {
        calculator.style.transform = '';
    }, 200);
});

// Calculator Functions
function updateDisplay() {
    display.textContent = formatNumber(currentInput);
    
    // Add display animation
    display.classList.add('calculating');
    setTimeout(() => {
        display.classList.remove('calculating');
    }, 500);
}

function formatNumber(num) {
    if (num.length > 12) {
        return parseFloat(num).toExponential(6);
    }
    return num;
}

function showCalculationLoading() {
    displayLoading.classList.add('show');
    return new Promise(resolve => {
        setTimeout(() => {
            displayLoading.classList.remove('show');
            resolve();
        }, 1000);
    });
}

function showButtonLoading(button) {
    button.classList.add('loading');
    setTimeout(() => {
        button.classList.remove('loading');
    }, 300);
}

function inputNumber(num) {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        if (waitingForOperand) {
            currentInput = num;
            waitingForOperand = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
        updateDisplay();
    }, 150);
}

function inputDecimal() {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        if (waitingForOperand) {
            currentInput = '0.';
            waitingForOperand = false;
        } else if (currentInput.indexOf('.') === -1) {
            currentInput += '.';
        }
        updateDisplay();
    }, 150);
}

function inputOperator(nextOperator) {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        const inputValue = parseFloat(currentInput);

        if (previousInput === null) {
            previousInput = inputValue;
        } else if (operator) {
            const currentValue = previousInput || 0;
            const newValue = performCalculation(currentValue, inputValue, operator);

            currentInput = String(newValue);
            previousInput = newValue;
            updateDisplay();
        }

        waitingForOperand = true;
        operator = nextOperator;
    }, 150);
}

function performCalculation(firstOperand, secondOperand, operator) {
    switch (operator) {
        case '+':
            return firstOperand + secondOperand;
        case '-':
            return firstOperand - secondOperand;
        case '*':
            return firstOperand * secondOperand;
        case '/':
            return secondOperand !== 0 ? firstOperand / secondOperand : 0;
        default:
            return secondOperand;
    }
}

async function calculate() {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    const inputValue = parseFloat(currentInput);

    if (previousInput !== null && operator) {
        // Show calculation loading
        await showCalculationLoading();
        
        const newValue = performCalculation(previousInput, inputValue, operator);
        currentInput = String(newValue);
        previousInput = null;
        operator = null;
        waitingForOperand = true;
        
        updateDisplay();
        
        // Add result animation
        display.style.animation = 'none';
        setTimeout(() => {
            display.style.animation = '';
        }, 10);
    }
}

function clearAll() {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        currentInput = '0';
        previousInput = null;
        operator = null;
        waitingForOperand = false;
        updateDisplay();
        
        // Clear animation
        animateClear();
    }, 150);
}

function clearEntry() {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        currentInput = '0';
        updateDisplay();
    }, 150);
}

function backspace() {
    const button = event.target.closest('.btn');
    showButtonLoading(button);
    
    setTimeout(() => {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }, 150);
}

function animateClear() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
        setTimeout(() => {
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }, index * 20);
    });
}

// Keyboard Support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+') {
        inputOperator('+');
    } else if (key === '-') {
        inputOperator('-');
    } else if (key === '*') {
        inputOperator('*');
    } else if (key === '/') {
        e.preventDefault();
        inputOperator('/');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        backspace();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startLoading();
    updateDisplay();
});

// Add hover effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', () => {
        if (!button.classList.contains('loading')) {
            button.style.transform = 'translateY(-3px)';
        }
    });
    
    button.addEventListener('mouseleave', () => {
        if (!button.classList.contains('loading')) {
            button.style.transform = '';
        }
    });
});