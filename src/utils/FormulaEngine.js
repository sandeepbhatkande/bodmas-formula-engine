import { create, all } from 'mathjs';

class FormulaEngine {
  constructor(customFunctions = {}) {
    // Create a mathjs instance with all functions
    this.math = create(all);
    
    // Configure mathjs for safer evaluation
    this.math.config({
      epsilon: 1e-12,
      matrix: 'Matrix',
      number: 'number',
      precision: 64,
      predictable: false,
      randomSeed: null
    });

    // Register custom functions
    this.registerBuiltInFunctions();
    this.registerCustomFunctions(customFunctions);
    
    // Store function metadata for autocomplete and help
    this.functionMetadata = this.buildFunctionMetadata();
  }

  registerBuiltInFunctions() {
    // String functions
    this.math.import({
      CONCAT: function(...args) {
        return args.map(arg => String(arg)).join('');
      },
      LEFT: function(text, numChars) {
        return String(text).substring(0, Math.max(0, numChars));
      },
      RIGHT: function(text, numChars) {
        const str = String(text);
        return str.substring(Math.max(0, str.length - numChars));
      },
      LEN: function(text) {
        return String(text).length;
      },
      UPPER: function(text) {
        return String(text).toUpperCase();
      },
      LOWER: function(text) {
        return String(text).toLowerCase();
      },
      TRIM: function(text) {
        return String(text).trim();
      },
      MID: function(text, start, length) {
        const str = String(text);
        const startIndex = Math.max(0, start - 1); // Convert to 0-based index
        return str.substring(startIndex, startIndex + length);
      },
      REPLACE: function(oldText, startNum, numChars, newText) {
        const str = String(oldText);
        const start = Math.max(0, startNum - 1);
        return str.substring(0, start) + String(newText) + str.substring(start + numChars);
      },
      SUBSTITUTE: function(text, oldText, newText, instanceNum = null) {
        let str = String(text);
        const old = String(oldText);
        const replacement = String(newText);
        
        if (instanceNum === null) {
          return str.split(old).join(replacement);
        } else {
          let count = 0;
          let index = 0;
          while ((index = str.indexOf(old, index)) !== -1) {
            count++;
            if (count === instanceNum) {
              return str.substring(0, index) + replacement + str.substring(index + old.length);
            }
            index += old.length;
          }
          return str;
        }
      },
      FIND: function(findText, withinText, startNum = 1) {
        const str = String(withinText);
        const find = String(findText);
        const start = Math.max(0, startNum - 1);
        const index = str.indexOf(find, start);
        return index === -1 ? -1 : index + 1; // Convert to 1-based index
      },
      SEARCH: function(findText, withinText, startNum = 1) {
        const str = String(withinText).toLowerCase();
        const find = String(findText).toLowerCase();
        const start = Math.max(0, startNum - 1);
        const index = str.indexOf(find, start);
        return index === -1 ? -1 : index + 1;
      }
    }, { override: true });

    // Math functions (enhanced)
    this.math.import({
      ABS: function(number) {
        return Math.abs(Number(number));
      },
      MAX: function(...args) {
        const numbers = args.map(Number);
        return Math.max(...numbers);
      },
      MIN: function(...args) {
        const numbers = args.map(Number);
        return Math.min(...numbers);
      },
      ROUND: function(number, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
      },
      ROUNDUP: function(number, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.ceil(number * factor) / factor;
      },
      ROUNDDOWN: function(number, decimals = 0) {
        const factor = Math.pow(10, decimals);
        return Math.floor(number * factor) / factor;
      },
      SUM: function(...args) {
        return args.reduce((sum, val) => sum + Number(val), 0);
      },
      AVERAGE: function(...args) {
        if (args.length === 0) return 0;
        return args.reduce((sum, val) => sum + Number(val), 0) / args.length;
      },
      COUNT: function(...args) {
        return args.length;
      },
      COUNTA: function(...args) {
        return args.filter(arg => arg !== null && arg !== undefined && arg !== '').length;
      },
      COUNTBLANK: function(...args) {
        return args.filter(arg => arg === null || arg === undefined || arg === '').length;
      },
      MOD: function(number, divisor) {
        return number % divisor;
      },
      POWER: function(number, power) {
        return Math.pow(number, power);
      },
      SQRT: function(number) {
        return Math.sqrt(number);
      },
      EXP: function(number) {
        return Math.exp(number);
      },
      LN: function(number) {
        return Math.log(number);
      },
      LOG: function(number, base = 10) {
        return Math.log(number) / Math.log(base);
      },
      LOG10: function(number) {
        return Math.log10(number);
      },
      SIGN: function(number) {
        return Math.sign(number);
      },
      INT: function(number) {
        return Math.floor(number);
      },
      TRUNC: function(number, digits = 0) {
        const factor = Math.pow(10, digits);
        return Math.trunc(number * factor) / factor;
      },
      RAND: function() {
        return Math.random();
      },
      RANDBETWEEN: function(bottom, top) {
        return Math.floor(Math.random() * (top - bottom + 1)) + bottom;
      }
    }, { override: true });

    // Statistical functions
    this.math.import({
      MEDIAN: function(...args) {
        const sorted = args.map(Number).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
      },
      MODE: function(...args) {
        const numbers = args.map(Number);
        const frequency = {};
        let maxFreq = 0;
        let mode = null;
        
        numbers.forEach(num => {
          frequency[num] = (frequency[num] || 0) + 1;
          if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
            mode = num;
          }
        });
        
        return maxFreq > 1 ? mode : null;
      },
      STDEV: function(...args) {
        const numbers = args.map(Number);
        const avg = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
        const squaredDiffs = numbers.map(val => Math.pow(val - avg, 2));
        const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (numbers.length - 1);
        return Math.sqrt(variance);
      },
      VAR: function(...args) {
        const numbers = args.map(Number);
        const avg = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
        const squaredDiffs = numbers.map(val => Math.pow(val - avg, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / (numbers.length - 1);
      },
      PERCENTILE: function(array, k) {
        const sorted = array.map(Number).sort((a, b) => a - b);
        const index = (k / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sorted.length) return sorted[sorted.length - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
      },
      QUARTILE: function(array, quart) {
        if (quart === 0) return Math.min(...array.map(Number));
        if (quart === 4) return Math.max(...array.map(Number));
        return this.PERCENTILE(array, quart * 25);
      }
    }, { override: true });

    // Logical functions (enhanced)
    this.math.import({
      IF: function(condition, valueIfTrue, valueIfFalse) {
        return condition ? valueIfTrue : valueIfFalse;
      },
      IFS: function(...args) {
        for (let i = 0; i < args.length - 1; i += 2) {
          if (args[i]) return args[i + 1];
        }
        return args.length % 2 === 1 ? args[args.length - 1] : null;
      },
      AND: function(...args) {
        return args.every(arg => Boolean(arg));
      },
      OR: function(...args) {
        return args.some(arg => Boolean(arg));
      },
      NOT: function(logical) {
        return !Boolean(logical);
      },
      XOR: function(...args) {
        return args.filter(arg => Boolean(arg)).length % 2 === 1;
      },
      ISNUMBER: function(value) {
        return typeof value === 'number' && !isNaN(value);
      },
      ISTEXT: function(value) {
        return typeof value === 'string';
      },
      ISBLANK: function(value) {
        return value === null || value === undefined || value === '';
      },
      ISERROR: function(value) {
        return value instanceof Error || (typeof value === 'string' && value.startsWith('Error:'));
      },
      SWITCH: function(expression, ...args) {
        for (let i = 0; i < args.length - 1; i += 2) {
          if (expression === args[i]) return args[i + 1];
        }
        return args.length % 2 === 1 ? args[args.length - 1] : null;
      }
    }, { override: true });

    // Date functions (enhanced)
    this.math.import({
      NOW: function() {
        return new Date();
      },
      TODAY: function() {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
      },
      DATE: function(year, month, day) {
        return new Date(year, month - 1, day); // month is 0-based in JS
      },
      TIME: function(hour, minute, second) {
        const date = new Date();
        date.setHours(hour, minute, second, 0);
        return date;
      },
      YEAR: function(date) {
        return new Date(date).getFullYear();
      },
      MONTH: function(date) {
        return new Date(date).getMonth() + 1; // 1-based month
      },
      DAY: function(date) {
        return new Date(date).getDate();
      },
      WEEKDAY: function(date, returnType = 1) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday
        if (returnType === 1) return day === 0 ? 7 : day; // Monday = 1
        if (returnType === 2) return day + 1; // Sunday = 1
        return day; // Sunday = 0
      },
      HOUR: function(date) {
        return new Date(date).getHours();
      },
      MINUTE: function(date) {
        return new Date(date).getMinutes();
      },
      SECOND: function(date) {
        return new Date(date).getSeconds();
      },
      DATEDIF: function(startDate, endDate, unit) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        
        switch (unit.toUpperCase()) {
          case 'D': return Math.floor(diffTime / (1000 * 60 * 60 * 24));
          case 'M': return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          case 'Y': return end.getFullYear() - start.getFullYear();
          case 'YM': return end.getMonth() - start.getMonth();
          case 'YD': return Math.floor((end - new Date(end.getFullYear(), start.getMonth(), start.getDate())) / (1000 * 60 * 60 * 24));
          case 'MD': return end.getDate() - start.getDate();
          default: return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
      },
      WORKDAY: function(startDate, days, holidays = []) {
        let current = new Date(startDate);
        let remainingDays = Math.abs(days);
        const direction = days >= 0 ? 1 : -1;
        const holidaySet = new Set(holidays.map(h => new Date(h).toDateString()));
        
        while (remainingDays > 0) {
          current.setDate(current.getDate() + direction);
          const dayOfWeek = current.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(current.toDateString())) {
            remainingDays--;
          }
        }
        
        return current;
      },
      NETWORKDAYS: function(startDate, endDate, holidays = []) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const holidaySet = new Set(holidays.map(h => new Date(h).toDateString()));
        let count = 0;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(d.toDateString())) {
            count++;
          }
        }
        
        return count;
      }
    }, { override: true });

    // Financial functions
    this.math.import({
      PMT: function(rate, nper, pv, fv = 0, type = 0) {
        if (rate === 0) return -(pv + fv) / nper;
        const pvif = Math.pow(1 + rate, nper);
        return -(rate * (pv * pvif + fv)) / ((pvif - 1) * (1 + rate * type));
      },
      PV: function(rate, nper, pmt, fv = 0, type = 0) {
        if (rate === 0) return -(pmt * nper + fv);
        const pvif = Math.pow(1 + rate, nper);
        return -(pmt * (1 + rate * type) * (pvif - 1) / rate + fv) / pvif;
      },
      FV: function(rate, nper, pmt, pv = 0, type = 0) {
        if (rate === 0) return -(pv + pmt * nper);
        const fvif = Math.pow(1 + rate, nper);
        return -(pv * fvif + pmt * (1 + rate * type) * (fvif - 1) / rate);
      },
      NPV: function(rate, ...values) {
        return values.reduce((npv, value, index) => {
          return npv + value / Math.pow(1 + rate, index + 1);
        }, 0);
      },
      IRR: function(values, guess = 0.1) {
        const maxIter = 100;
        const tolerance = 1e-6;
        let rate = guess;
        
        for (let i = 0; i < maxIter; i++) {
          let npv = 0;
          let dnpv = 0;
          
          for (let j = 0; j < values.length; j++) {
            npv += values[j] / Math.pow(1 + rate, j);
            dnpv -= j * values[j] / Math.pow(1 + rate, j + 1);
          }
          
          if (Math.abs(npv) < tolerance) return rate;
          rate = rate - npv / dnpv;
        }
        
        return rate;
      },
      RATE: function(nper, pmt, pv, fv = 0, type = 0, guess = 0.1) {
        const maxIter = 100;
        const tolerance = 1e-6;
        let rate = guess;
        
        for (let i = 0; i < maxIter; i++) {
          const f = pv * Math.pow(1 + rate, nper) + pmt * (1 + rate * type) * (Math.pow(1 + rate, nper) - 1) / rate + fv;
          const df = nper * pv * Math.pow(1 + rate, nper - 1) + pmt * (1 + rate * type) * (nper * Math.pow(1 + rate, nper - 1) / rate - (Math.pow(1 + rate, nper) - 1) / (rate * rate));
          
          if (Math.abs(f) < tolerance) return rate;
          rate = rate - f / df;
        }
        
        return rate;
      }
    }, { override: true });

    // Utility functions
    this.math.import({
      CHOOSE: function(indexNum, ...values) {
        const index = Math.floor(indexNum) - 1; // Convert to 0-based
        return index >= 0 && index < values.length ? values[index] : null;
      },
      INDEX: function(array, rowNum, colNum = 1) {
        if (Array.isArray(array[0])) {
          // 2D array
          const row = rowNum - 1;
          const col = colNum - 1;
          return array[row] && array[row][col] !== undefined ? array[row][col] : null;
        } else {
          // 1D array
          const index = rowNum - 1;
          return array[index] !== undefined ? array[index] : null;
        }
      },
      MATCH: function(lookupValue, lookupArray, matchType = 1) {
        for (let i = 0; i < lookupArray.length; i++) {
          if (matchType === 0 && lookupArray[i] === lookupValue) {
            return i + 1; // 1-based index
          } else if (matchType === 1 && lookupArray[i] >= lookupValue) {
            return i + 1;
          } else if (matchType === -1 && lookupArray[i] <= lookupValue) {
            return i + 1;
          }
        }
        return -1;
      },
      VLOOKUP: function(lookupValue, tableArray, colIndexNum, rangeLookup = true) {
        for (let i = 0; i < tableArray.length; i++) {
          const row = tableArray[i];
          if (rangeLookup) {
            if (row[0] <= lookupValue) {
              if (i === tableArray.length - 1 || tableArray[i + 1][0] > lookupValue) {
                return row[colIndexNum - 1];
              }
            }
          } else {
            if (row[0] === lookupValue) {
              return row[colIndexNum - 1];
            }
          }
        }
        return null;
      },
      HLOOKUP: function(lookupValue, tableArray, rowIndexNum, rangeLookup = true) {
        const firstRow = tableArray[0];
        for (let i = 0; i < firstRow.length; i++) {
          if (rangeLookup) {
            if (firstRow[i] <= lookupValue) {
              if (i === firstRow.length - 1 || firstRow[i + 1] > lookupValue) {
                return tableArray[rowIndexNum - 1][i];
              }
            }
          } else {
            if (firstRow[i] === lookupValue) {
              return tableArray[rowIndexNum - 1][i];
            }
          }
        }
        return null;
      }
    }, { override: true });
  }

  registerCustomFunctions(customFunctions) {
    if (customFunctions && typeof customFunctions === 'object') {
      this.math.import(customFunctions, { override: true });
    }
  }

  buildFunctionMetadata() {
    return {
      // String functions
      CONCAT: {
        name: 'CONCAT',
        signature: 'CONCAT(text1, text2, ...)',
        description: 'Concatenates two or more text strings',
        insertText: 'CONCAT(parameter1, parameter2)',
        category: 'string',
        example: 'CONCAT("Hello", " ", "World")',
        returnType: 'string'
      },
      LEFT: {
        name: 'LEFT',
        signature: 'LEFT(text, num_chars)',
        description: 'Returns the leftmost characters from a text string',
        insertText: 'LEFT(parameter1, parameter2)',
        category: 'string',
        example: 'LEFT("Hello World", 5)',
        returnType: 'string'
      },
      RIGHT: {
        name: 'RIGHT',
        signature: 'RIGHT(text, num_chars)',
        description: 'Returns the rightmost characters from a text string',
        insertText: 'RIGHT(parameter1, parameter2)',
        category: 'string',
        example: 'RIGHT("Hello World", 5)',
        returnType: 'string'
      },
      MID: {
        name: 'MID',
        signature: 'MID(text, start_num, num_chars)',
        description: 'Returns characters from the middle of a text string',
        insertText: 'MID(parameter1, parameter2, parameter3)',
        category: 'string',
        example: 'MID("Hello World", 3, 5)',
        returnType: 'string'
      },
      LEN: {
        name: 'LEN',
        signature: 'LEN(text)',
        description: 'Returns the length of a text string',
        insertText: 'LEN(parameter1)',
        category: 'string',
        example: 'LEN("Hello World")',
        returnType: 'number'
      },
      UPPER: {
        name: 'UPPER',
        signature: 'UPPER(text)',
        description: 'Converts text to uppercase',
        insertText: 'UPPER(parameter1)',
        category: 'string',
        example: 'UPPER("hello")',
        returnType: 'string'
      },
      LOWER: {
        name: 'LOWER',
        signature: 'LOWER(text)',
        description: 'Converts text to lowercase',
        insertText: 'LOWER(parameter1)',
        category: 'string',
        example: 'LOWER("HELLO")',
        returnType: 'string'
      },
      TRIM: {
        name: 'TRIM',
        signature: 'TRIM(text)',
        description: 'Removes extra spaces from text',
        insertText: 'TRIM(parameter1)',
        category: 'string',
        example: 'TRIM("  Hello World  ")',
        returnType: 'string'
      },
      REPLACE: {
        name: 'REPLACE',
        signature: 'REPLACE(old_text, start_num, num_chars, new_text)',
        description: 'Replaces part of a text string with different text',
        insertText: 'REPLACE(parameter1, parameter2, parameter3, parameter4)',
        category: 'string',
        example: 'REPLACE("Hello World", 7, 5, "Excel")',
        returnType: 'string'
      },
      SUBSTITUTE: {
        name: 'SUBSTITUTE',
        signature: 'SUBSTITUTE(text, old_text, new_text, instance_num)',
        description: 'Substitutes old text with new text in a string',
        insertText: 'SUBSTITUTE(parameter1, parameter2, parameter3)',
        category: 'string',
        example: 'SUBSTITUTE("Hello World", "World", "Excel")',
        returnType: 'string'
      },
      FIND: {
        name: 'FIND',
        signature: 'FIND(find_text, within_text, start_num)',
        description: 'Finds one text string within another (case-sensitive)',
        insertText: 'FIND(parameter1, parameter2)',
        category: 'string',
        example: 'FIND("World", "Hello World")',
        returnType: 'number'
      },
      SEARCH: {
        name: 'SEARCH',
        signature: 'SEARCH(find_text, within_text, start_num)',
        description: 'Finds one text string within another (case-insensitive)',
        insertText: 'SEARCH(parameter1, parameter2)',
        category: 'string',
        example: 'SEARCH("world", "Hello World")',
        returnType: 'number'
      },

      // Math functions
      ROUND: {
        name: 'ROUND',
        signature: 'ROUND(number, decimals)',
        description: 'Rounds a number to specified decimal places',
        insertText: 'ROUND(parameter1, parameter2)',
        category: 'math',
        example: 'ROUND(3.14159, 2)',
        returnType: 'number'
      },
      ROUNDUP: {
        name: 'ROUNDUP',
        signature: 'ROUNDUP(number, decimals)',
        description: 'Rounds a number up to specified decimal places',
        insertText: 'ROUNDUP(parameter1, parameter2)',
        category: 'math',
        example: 'ROUNDUP(3.14159, 2)',
        returnType: 'number'
      },
      ROUNDDOWN: {
        name: 'ROUNDDOWN',
        signature: 'ROUNDDOWN(number, decimals)',
        description: 'Rounds a number down to specified decimal places',
        insertText: 'ROUNDDOWN(parameter1, parameter2)',
        category: 'math',
        example: 'ROUNDDOWN(3.14159, 2)',
        returnType: 'number'
      },
      ABS: {
        name: 'ABS',
        signature: 'ABS(number)',
        description: 'Returns the absolute value of a number',
        insertText: 'ABS(parameter1)',
        category: 'math',
        example: 'ABS(-5)',
        returnType: 'number'
      },
      MAX: {
        name: 'MAX',
        signature: 'MAX(number1, number2, ...)',
        description: 'Returns the maximum value from a list of numbers',
        insertText: 'MAX(parameter1, parameter2)',
        category: 'math',
        example: 'MAX(10, 20, 5)',
        returnType: 'number'
      },
      MIN: {
        name: 'MIN',
        signature: 'MIN(number1, number2, ...)',
        description: 'Returns the minimum value from a list of numbers',
        insertText: 'MIN(parameter1, parameter2)',
        category: 'math',
        example: 'MIN(10, 20, 5)',
        returnType: 'number'
      },
      SUM: {
        name: 'SUM',
        signature: 'SUM(number1, number2, ...)',
        description: 'Returns the sum of all numbers',
        insertText: 'SUM(parameter1, parameter2)',
        category: 'math',
        example: 'SUM(1, 2, 3, 4)',
        returnType: 'number'
      },
      AVERAGE: {
        name: 'AVERAGE',
        signature: 'AVERAGE(number1, number2, ...)',
        description: 'Returns the average of all numbers',
        insertText: 'AVERAGE(parameter1, parameter2)',
        category: 'math',
        example: 'AVERAGE(10, 20, 30)',
        returnType: 'number'
      },
      COUNT: {
        name: 'COUNT',
        signature: 'COUNT(value1, value2, ...)',
        description: 'Counts the number of values',
        insertText: 'COUNT(parameter1, parameter2)',
        category: 'math',
        example: 'COUNT(1, 2, 3, "text")',
        returnType: 'number'
      },
      COUNTA: {
        name: 'COUNTA',
        signature: 'COUNTA(value1, value2, ...)',
        description: 'Counts non-empty values',
        insertText: 'COUNTA(parameter1, parameter2)',
        category: 'math',
        example: 'COUNTA(1, 2, "", "text")',
        returnType: 'number'
      },
      COUNTBLANK: {
        name: 'COUNTBLANK',
        signature: 'COUNTBLANK(value1, value2, ...)',
        description: 'Counts empty values',
        insertText: 'COUNTBLANK(parameter1, parameter2)',
        category: 'math',
        example: 'COUNTBLANK(1, "", null)',
        returnType: 'number'
      },
      MOD: {
        name: 'MOD',
        signature: 'MOD(number, divisor)',
        description: 'Returns the remainder after division',
        insertText: 'MOD(parameter1, parameter2)',
        category: 'math',
        example: 'MOD(10, 3)',
        returnType: 'number'
      },
      POWER: {
        name: 'POWER',
        signature: 'POWER(number, power)',
        description: 'Returns the result of a number raised to a power',
        insertText: 'POWER(parameter1, parameter2)',
        category: 'math',
        example: 'POWER(2, 3)',
        returnType: 'number'
      },
      SQRT: {
        name: 'SQRT',
        signature: 'SQRT(number)',
        description: 'Returns the square root of a number',
        insertText: 'SQRT(parameter1)',
        category: 'math',
        example: 'SQRT(16)',
        returnType: 'number'
      },
      EXP: {
        name: 'EXP',
        signature: 'EXP(number)',
        description: 'Returns e raised to the power of a number',
        insertText: 'EXP(parameter1)',
        category: 'math',
        example: 'EXP(1)',
        returnType: 'number'
      },
      LN: {
        name: 'LN',
        signature: 'LN(number)',
        description: 'Returns the natural logarithm of a number',
        insertText: 'LN(parameter1)',
        category: 'math',
        example: 'LN(10)',
        returnType: 'number'
      },
      LOG: {
        name: 'LOG',
        signature: 'LOG(number, base)',
        description: 'Returns the logarithm of a number to a specified base',
        insertText: 'LOG(parameter1, parameter2)',
        category: 'math',
        example: 'LOG(100, 10)',
        returnType: 'number'
      },
      LOG10: {
        name: 'LOG10',
        signature: 'LOG10(number)',
        description: 'Returns the base-10 logarithm of a number',
        insertText: 'LOG10(parameter1)',
        category: 'math',
        example: 'LOG10(100)',
        returnType: 'number'
      },
      SIGN: {
        name: 'SIGN',
        signature: 'SIGN(number)',
        description: 'Returns the sign of a number',
        insertText: 'SIGN(parameter1)',
        category: 'math',
        example: 'SIGN(-5)',
        returnType: 'number'
      },
      INT: {
        name: 'INT',
        signature: 'INT(number)',
        description: 'Rounds a number down to the nearest integer',
        insertText: 'INT(parameter1)',
        category: 'math',
        example: 'INT(3.7)',
        returnType: 'number'
      },
      TRUNC: {
        name: 'TRUNC',
        signature: 'TRUNC(number, digits)',
        description: 'Truncates a number to specified decimal places',
        insertText: 'TRUNC(parameter1, parameter2)',
        category: 'math',
        example: 'TRUNC(3.14159, 2)',
        returnType: 'number'
      },
      RAND: {
        name: 'RAND',
        signature: 'RAND()',
        description: 'Returns a random number between 0 and 1',
        insertText: 'RAND()',
        category: 'math',
        example: 'RAND()',
        returnType: 'number'
      },
      RANDBETWEEN: {
        name: 'RANDBETWEEN',
        signature: 'RANDBETWEEN(bottom, top)',
        description: 'Returns a random integer between two numbers',
        insertText: 'RANDBETWEEN(parameter1, parameter2)',
        category: 'math',
        example: 'RANDBETWEEN(1, 10)',
        returnType: 'number'
      },

      // Statistical functions
      MEDIAN: {
        name: 'MEDIAN',
        signature: 'MEDIAN(number1, number2, ...)',
        description: 'Returns the median of a set of numbers',
        insertText: 'MEDIAN(parameter1, parameter2)',
        category: 'statistical',
        example: 'MEDIAN(1, 2, 3, 4, 5)',
        returnType: 'number'
      },
      MODE: {
        name: 'MODE',
        signature: 'MODE(number1, number2, ...)',
        description: 'Returns the most frequently occurring value',
        insertText: 'MODE(parameter1, parameter2)',
        category: 'statistical',
        example: 'MODE(1, 2, 2, 3, 4)',
        returnType: 'number'
      },
      STDEV: {
        name: 'STDEV',
        signature: 'STDEV(number1, number2, ...)',
        description: 'Returns the standard deviation of a sample',
        insertText: 'STDEV(parameter1, parameter2)',
        category: 'statistical',
        example: 'STDEV(1, 2, 3, 4, 5)',
        returnType: 'number'
      },
      VAR: {
        name: 'VAR',
        signature: 'VAR(number1, number2, ...)',
        description: 'Returns the variance of a sample',
        insertText: 'VAR(parameter1, parameter2)',
        category: 'statistical',
        example: 'VAR(1, 2, 3, 4, 5)',
        returnType: 'number'
      },
      PERCENTILE: {
        name: 'PERCENTILE',
        signature: 'PERCENTILE(array, k)',
        description: 'Returns the k-th percentile of values',
        insertText: 'PERCENTILE(parameter1, parameter2)',
        category: 'statistical',
        example: 'PERCENTILE([1,2,3,4,5], 50)',
        returnType: 'number'
      },
      QUARTILE: {
        name: 'QUARTILE',
        signature: 'QUARTILE(array, quart)',
        description: 'Returns the quartile of a data set',
        insertText: 'QUARTILE(parameter1, parameter2)',
        category: 'statistical',
        example: 'QUARTILE([1,2,3,4,5], 2)',
        returnType: 'number'
      },

      // Logical functions
      IF: {
        name: 'IF',
        signature: 'IF(condition, value_if_true, value_if_false)',
        description: 'Returns one value if condition is true, another if false',
        insertText: 'IF(parameter1, parameter2, parameter3)',
        category: 'logical',
        example: 'IF(5 > 3, "Yes", "No")',
        returnType: 'any'
      },
      IFS: {
        name: 'IFS',
        signature: 'IFS(condition1, value1, condition2, value2, ...)',
        description: 'Checks multiple conditions and returns corresponding values',
        insertText: 'IFS(parameter1, parameter2, parameter3, parameter4)',
        category: 'logical',
        example: 'IFS(A1>90, "A", A1>80, "B", A1>70, "C")',
        returnType: 'any'
      },
      AND: {
        name: 'AND',
        signature: 'AND(logical1, logical2, ...)',
        description: 'Returns true if all conditions are true',
        insertText: 'AND(parameter1, parameter2)',
        category: 'logical',
        example: 'AND(5 > 3, 10 < 20)',
        returnType: 'boolean'
      },
      OR: {
        name: 'OR',
        signature: 'OR(logical1, logical2, ...)',
        description: 'Returns true if any condition is true',
        insertText: 'OR(parameter1, parameter2)',
        category: 'logical',
        example: 'OR(5 > 10, 3 < 5)',
        returnType: 'boolean'
      },
      NOT: {
        name: 'NOT',
        signature: 'NOT(logical)',
        description: 'Returns the opposite of a logical value',
        insertText: 'NOT(parameter1)',
        category: 'logical',
        example: 'NOT(5 > 10)',
        returnType: 'boolean'
      },
      XOR: {
        name: 'XOR',
        signature: 'XOR(logical1, logical2, ...)',
        description: 'Returns true if an odd number of conditions are true',
        insertText: 'XOR(parameter1, parameter2)',
        category: 'logical',
        example: 'XOR(true, false, true)',
        returnType: 'boolean'
      },
      ISNUMBER: {
        name: 'ISNUMBER',
        signature: 'ISNUMBER(value)',
        description: 'Returns true if value is a number',
        insertText: 'ISNUMBER(parameter1)',
        category: 'logical',
        example: 'ISNUMBER(123)',
        returnType: 'boolean'
      },
      ISTEXT: {
        name: 'ISTEXT',
        signature: 'ISTEXT(value)',
        description: 'Returns true if value is text',
        insertText: 'ISTEXT(parameter1)',
        category: 'logical',
        example: 'ISTEXT("Hello")',
        returnType: 'boolean'
      },
      ISBLANK: {
        name: 'ISBLANK',
        signature: 'ISBLANK(value)',
        description: 'Returns true if value is blank',
        insertText: 'ISBLANK(parameter1)',
        category: 'logical',
        example: 'ISBLANK("")',
        returnType: 'boolean'
      },
      ISERROR: {
        name: 'ISERROR',
        signature: 'ISERROR(value)',
        description: 'Returns true if value is an error',
        insertText: 'ISERROR(parameter1)',
        category: 'logical',
        example: 'ISERROR(1/0)',
        returnType: 'boolean'
      },
      SWITCH: {
        name: 'SWITCH',
        signature: 'SWITCH(expression, value1, result1, value2, result2, ...)',
        description: 'Evaluates expression against a list of values',
        insertText: 'SWITCH(parameter1, parameter2, parameter3)',
        category: 'logical',
        example: 'SWITCH(2, 1, "One", 2, "Two", 3, "Three")',
        returnType: 'any'
      },

      // Date functions
      NOW: {
        name: 'NOW',
        signature: 'NOW()',
        description: 'Returns the current date and time',
        insertText: 'NOW()',
        category: 'date',
        example: 'NOW()',
        returnType: 'date'
      },
      TODAY: {
        name: 'TODAY',
        signature: 'TODAY()',
        description: 'Returns the current date',
        insertText: 'TODAY()',
        category: 'date',
        example: 'TODAY()',
        returnType: 'date'
      },
      DATE: {
        name: 'DATE',
        signature: 'DATE(year, month, day)',
        description: 'Creates a date from year, month, and day',
        insertText: 'DATE(parameter1, parameter2, parameter3)',
        category: 'date',
        example: 'DATE(2024, 1, 15)',
        returnType: 'date'
      },
      TIME: {
        name: 'TIME',
        signature: 'TIME(hour, minute, second)',
        description: 'Creates a time from hour, minute, and second',
        insertText: 'TIME(parameter1, parameter2, parameter3)',
        category: 'date',
        example: 'TIME(14, 30, 0)',
        returnType: 'date'
      },
      YEAR: {
        name: 'YEAR',
        signature: 'YEAR(date)',
        description: 'Returns the year from a date',
        insertText: 'YEAR(parameter1)',
        category: 'date',
        example: 'YEAR(NOW())',
        returnType: 'number'
      },
      MONTH: {
        name: 'MONTH',
        signature: 'MONTH(date)',
        description: 'Returns the month from a date',
        insertText: 'MONTH(parameter1)',
        category: 'date',
        example: 'MONTH(NOW())',
        returnType: 'number'
      },
      DAY: {
        name: 'DAY',
        signature: 'DAY(date)',
        description: 'Returns the day from a date',
        insertText: 'DAY(parameter1)',
        category: 'date',
        example: 'DAY(NOW())',
        returnType: 'number'
      },
      WEEKDAY: {
        name: 'WEEKDAY',
        signature: 'WEEKDAY(date, return_type)',
        description: 'Returns the day of the week as a number',
        insertText: 'WEEKDAY(parameter1, parameter2)',
        category: 'date',
        example: 'WEEKDAY(TODAY(), 1)',
        returnType: 'number'
      },
      HOUR: {
        name: 'HOUR',
        signature: 'HOUR(time)',
        description: 'Returns the hour from a time',
        insertText: 'HOUR(parameter1)',
        category: 'date',
        example: 'HOUR(NOW())',
        returnType: 'number'
      },
      MINUTE: {
        name: 'MINUTE',
        signature: 'MINUTE(time)',
        description: 'Returns the minute from a time',
        insertText: 'MINUTE(parameter1)',
        category: 'date',
        example: 'MINUTE(NOW())',
        returnType: 'number'
      },
      SECOND: {
        name: 'SECOND',
        signature: 'SECOND(time)',
        description: 'Returns the second from a time',
        insertText: 'SECOND(parameter1)',
        category: 'date',
        example: 'SECOND(NOW())',
        returnType: 'number'
      },
      DATEDIF: {
        name: 'DATEDIF',
        signature: 'DATEDIF(start_date, end_date, unit)',
        description: 'Calculates the difference between two dates',
        insertText: 'DATEDIF(parameter1, parameter2, parameter3)',
        category: 'date',
        example: 'DATEDIF(DATE(2024,1,1), TODAY(), "D")',
        returnType: 'number'
      },
      WORKDAY: {
        name: 'WORKDAY',
        signature: 'WORKDAY(start_date, days, holidays)',
        description: 'Returns a date that is a specified number of working days from start date',
        insertText: 'WORKDAY(parameter1, parameter2)',
        category: 'date',
        example: 'WORKDAY(TODAY(), 10)',
        returnType: 'date'
      },
      NETWORKDAYS: {
        name: 'NETWORKDAYS',
        signature: 'NETWORKDAYS(start_date, end_date, holidays)',
        description: 'Returns the number of working days between two dates',
        insertText: 'NETWORKDAYS(parameter1, parameter2)',
        category: 'date',
        example: 'NETWORKDAYS(DATE(2024,1,1), TODAY())',
        returnType: 'number'
      },

      // Financial functions
      PMT: {
        name: 'PMT',
        signature: 'PMT(rate, nper, pv, fv, type)',
        description: 'Calculates the payment for a loan',
        insertText: 'PMT(parameter1, parameter2, parameter3)',
        category: 'financial',
        example: 'PMT(0.05/12, 60, 10000)',
        returnType: 'number'
      },
      PV: {
        name: 'PV',
        signature: 'PV(rate, nper, pmt, fv, type)',
        description: 'Calculates the present value of an investment',
        insertText: 'PV(parameter1, parameter2, parameter3)',
        category: 'financial',
        example: 'PV(0.05/12, 60, -200)',
        returnType: 'number'
      },
      FV: {
        name: 'FV',
        signature: 'FV(rate, nper, pmt, pv, type)',
        description: 'Calculates the future value of an investment',
        insertText: 'FV(parameter1, parameter2, parameter3)',
        category: 'financial',
        example: 'FV(0.05/12, 60, -200, 0)',
        returnType: 'number'
      },
      NPV: {
        name: 'NPV',
        signature: 'NPV(rate, value1, value2, ...)',
        description: 'Calculates the net present value of an investment',
        insertText: 'NPV(parameter1, parameter2)',
        category: 'financial',
        example: 'NPV(0.1, -1000, 300, 400, 500)',
        returnType: 'number'
      },
      IRR: {
        name: 'IRR',
        signature: 'IRR(values, guess)',
        description: 'Calculates the internal rate of return',
        insertText: 'IRR(parameter1)',
        category: 'financial',
        example: 'IRR([-1000, 300, 400, 500])',
        returnType: 'number'
      },
      RATE: {
        name: 'RATE',
        signature: 'RATE(nper, pmt, pv, fv, type, guess)',
        description: 'Calculates the interest rate per period',
        insertText: 'RATE(parameter1, parameter2, parameter3)',
        category: 'financial',
        example: 'RATE(60, -200, 10000)',
        returnType: 'number'
      },

      // Utility functions
      CHOOSE: {
        name: 'CHOOSE',
        signature: 'CHOOSE(index_num, value1, value2, ...)',
        description: 'Chooses a value from a list based on index',
        insertText: 'CHOOSE(parameter1, parameter2, parameter3)',
        category: 'utility',
        example: 'CHOOSE(2, "Apple", "Orange", "Banana")',
        returnType: 'any'
      },
      INDEX: {
        name: 'INDEX',
        signature: 'INDEX(array, row_num, col_num)',
        description: 'Returns a value from an array at specified position',
        insertText: 'INDEX(parameter1, parameter2)',
        category: 'utility',
        example: 'INDEX([1,2,3,4], 2)',
        returnType: 'any'
      },
      MATCH: {
        name: 'MATCH',
        signature: 'MATCH(lookup_value, lookup_array, match_type)',
        description: 'Returns the position of a value in an array',
        insertText: 'MATCH(parameter1, parameter2)',
        category: 'utility',
        example: 'MATCH("Orange", ["Apple","Orange","Banana"], 0)',
        returnType: 'number'
      },
      VLOOKUP: {
        name: 'VLOOKUP',
        signature: 'VLOOKUP(lookup_value, table_array, col_index_num, range_lookup)',
        description: 'Looks up a value in the first column and returns a value in the same row',
        insertText: 'VLOOKUP(parameter1, parameter2, parameter3)',
        category: 'utility',
        example: 'VLOOKUP("Apple", table, 2, false)',
        returnType: 'any'
      },
      HLOOKUP: {
        name: 'HLOOKUP',
        signature: 'HLOOKUP(lookup_value, table_array, row_index_num, range_lookup)',
        description: 'Looks up a value in the first row and returns a value in the same column',
        insertText: 'HLOOKUP(parameter1, parameter2, parameter3)',
        category: 'utility',
        example: 'HLOOKUP("Q1", table, 2, false)',
        returnType: 'any'
      }
    };
  }

  validateExpression(formula) {
    if (!formula || typeof formula !== 'string') {
      return { valid: false, error: 'Formula must be a non-empty string' };
    }

    try {
      // Parse the expression to create AST
      const node = this.math.parse(formula);
      
      // Additional validation can be added here
      // For example, checking for dangerous functions, recursion limits, etc.
      
      return { valid: true, ast: node };
    } catch (error) {
      return { 
        valid: false, 
        error: this.formatError(error.message),
        originalError: error
      };
    }
  }

  evaluateFormula(formula, context = {}) {
    const validation = this.validateExpression(formula);
    
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Evaluate with context variables
      const result = this.math.evaluate(formula, context);
      return result;
    } catch (error) {
      throw new Error(`Evaluation error: ${this.formatError(error.message)}`);
    }
  }

  formatError(errorMessage) {
    // Clean up common mathjs error messages for better user experience
    let formatted = errorMessage;
    
    // Replace technical terms with user-friendly ones
    formatted = formatted.replace(/parse error/gi, 'syntax error');
    formatted = formatted.replace(/unexpected token/gi, 'unexpected character');
    formatted = formatted.replace(/expected/gi, 'missing');
    
    return formatted;
  }

  getFunctionSuggestions() {
    return Object.values(this.functionMetadata);
  }

  getFunctionInfo(functionName) {
    return this.functionMetadata[functionName.toUpperCase()] || null;
  }

  getFunctionsByCategory(category) {
    return Object.values(this.functionMetadata).filter(
      func => func.category === category
    );
  }

  // Utility method to check BODMAS compliance
  checkBODMAS(formula) {
    try {
      const node = this.math.parse(formula);
      return this.analyzeBODMAS(node);
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  analyzeBODMAS(node) {
    // This is a simplified BODMAS analysis
    // In a full implementation, you'd want more sophisticated precedence checking
    const precedence = {
      '^': 4,    // Exponentiation (Orders)
      '*': 3,    // Multiplication
      '/': 3,    // Division
      '+': 2,    // Addition
      '-': 2,    // Subtraction
      '(': 1,    // Parentheses (handled separately)
      ')': 1
    };

    if (node.type === 'OperatorNode') {
      return {
        valid: true,
        operator: node.op,
        precedence: precedence[node.op] || 0,
        leftAssociative: !['^'].includes(node.op)
      };
    }

    return { valid: true };
  }

  // Method to get evaluation steps (useful for debugging)
  getEvaluationSteps(formula, context = {}) {
    try {
      const steps = [];
      
      // Parse the expression
      const expr = this.math.parse(formula);
      
      // Create evaluation context
      const scope = { ...context };
      
      // Evaluate and track steps
      const result = expr.evaluate(scope);
      
      steps.push({
        step: 1,
        description: 'Final result',
        expression: formula,
        result: result
      });
      
      return {
        steps: steps,
        finalResult: result,
        valid: true
      };
    } catch (error) {
      return {
        steps: [],
        finalResult: null,
        valid: false,
        error: this.formatError(error.message)
      };
    }
  }
}

export { FormulaEngine }; 