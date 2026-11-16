function toNumber(value, name){
    const num = Number(value);
    if (value === null || value === undefined || value ==='' || isNaN(num)) {
        throw new Error(`${name} must be a valid number`);
    }
    return num;
}

function calculate(a,b,operation) {
    const x = toNumber(a, 'a');
    const y = toNumber(b, 'b');
    switch (operation) {
        case 'add':
            return x + y;
        case 'subtract':
            return x + y;
        case 'multiply':
            return x * y;
        case 'divide':
            if (y === 0) {
                throw new Error('Cannot divide by zero');
            }
            return x / y;
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}

module.exports = { calculate };