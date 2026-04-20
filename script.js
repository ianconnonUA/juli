class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.resetNext = false;
    }

    delete() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'NaN') {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'NaN') this.clear();
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.resetNext) {
            this.currentOperand = number.toString();
            this.resetNext = false;
        } else {
            if (this.currentOperand === '0' && number !== '.') {
                this.currentOperand = number.toString();
            } else {
                this.currentOperand = this.currentOperand.toString() + number.toString();
            }
        }
    }

    chooseOperation(operation, operatorSymbol) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.operatorSymbol = operatorSymbol;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            case 'pow':
                computation = Math.pow(prev, current);
                break;
            case 'exp':
                computation = prev * Math.pow(10, current);
                break;
            default:
                return;
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.resetNext = true;
    }

    computeScientific(action) {
        if (this.currentOperand === 'Error') return;
        let current = parseFloat(this.currentOperand);
        if (isNaN(current) && action !== 'pi' && action !== 'e') return;

        let computation;

        switch (action) {
            case 'sin':
                // Assuming degrees for user convenience, can be changed to radians
                computation = Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                computation = Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                computation = Math.tan(current * Math.PI / 180);
                break;
            case 'log':
                if (current <= 0) computation = 'Error';
                else computation = Math.log10(current);
                break;
            case 'ln':
                if (current <= 0) computation = 'Error';
                else computation = Math.log(current);
                break;
            case 'sqrt':
                if (current < 0) computation = 'Error';
                else computation = Math.sqrt(current);
                break;
            case 'square':
                computation = Math.pow(current, 2);
                break;
            case 'percent':
                computation = current / 100;
                break;
            case 'fact':
                if (current < 0 || !Number.isInteger(current)) computation = 'Error';
                else {
                    computation = 1;
                    for (let i = 2; i <= current; i++) computation *= i;
                }
                break;
            case 'pi':
                computation = Math.PI;
                break;
            case 'e':
                computation = Math.E;
                break;
            default:
                return;
        }

        this.currentOperand = computation.toString();
        this.resetNext = true;
    }

    getDisplayNumber(number) {
        if (number === 'Error' || number === 'NaN') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operatorSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('btn-number')) {
            calculator.appendNumber(button.dataset.number);
            calculator.updateDisplay();
        } else if (button.classList.contains('btn-operator') && button.dataset.action !== 'calculate') {
            calculator.chooseOperation(button.dataset.action, button.innerText);
            calculator.updateDisplay();
        } else if (button.classList.contains('btn-equals')) {
            calculator.compute();
            calculator.updateDisplay();
        } else if (button.dataset.action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
        } else if (button.dataset.action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        } else if (button.classList.contains('btn-sci')) {
            if (button.dataset.action === 'pow' || button.dataset.action === 'exp') {
                calculator.chooseOperation(button.dataset.action, button.innerText);
            } else if (button.dataset.action !== 'open-paren' && button.dataset.action !== 'close-paren') {
                // simple scientific functions that apply immediately to current operand
                calculator.computeScientific(button.dataset.action);
            }
            calculator.updateDisplay();
        }
    });
});
