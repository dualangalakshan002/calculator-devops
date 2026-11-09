function toNumber(value, name){
    const num = Number(value);
    if (value === null || value === undefined || value ==='' || isNaN(num)) {
        throw new Error(`Invalid value for ${name}: ${value}`);
    }
    return num;
}

function calculate(operation, a, b) {
    const x = toNumber(a, 'a');
    const y = toNumber(b, 'b');
    switch (operation) {
        case 'add':
            return x + y;
        case 'subtract':
            return x - y;
        case 'multiply':
            return x * y;
        case 'divide':
            if (y === 0) {
                throw new Error('cannot division by zero');
            }
            return x / y;
        default:
            throw new Error(`Invalid operation: ${operation}`);
    }
}