export function getTestHarness(language: string, code: string) {
  if (language === 'javascript' || language === 'typescript') {
    return `${code}

// --- TEST HARNESS ---
const fs = require('fs');
let inputStr = '';
try {
  inputStr = fs.readFileSync(0, 'utf-8');
} catch (e) {}

if (inputStr.trim()) {
  try {
    const inputObj = JSON.parse(inputStr);
    let inputs;
    if (typeof inputObj === 'object' && inputObj !== null) {
      if (Array.isArray(inputObj)) {
        inputs = inputObj;
      } else {
        inputs = Object.values(inputObj);
      }
    } else {
      inputs = [inputObj];
    }
    
    let fn = typeof solution === 'function' ? solution : null;
    if (!fn) {
      const funcs = Object.values(globalThis).filter(f => typeof f === 'function');
      if (funcs.length > 0) fn = funcs[funcs.length - 1];
    }

    if (fn) {
      const result = fn(...inputs);
      const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
      console.log(resultStr);
    }
  } catch (e) {
    console.error(e);
  }
}
`;
  } else if (language === 'python') {
    return `${code}

# --- TEST HARNESS ---
import sys
import json
import types

input_str = sys.stdin.read().strip()
if input_str:
    try:
        input_obj = json.loads(input_str)
        if isinstance(input_obj, dict):
            inputs = list(input_obj.values())
        elif isinstance(input_obj, list):
            inputs = input_obj
        else:
            inputs = [input_obj]
            
        user_funcs = [f for n, f in globals().items() if isinstance(f, types.FunctionType) and n != 'json' and n != 'sys']
        func = user_funcs[-1] if user_funcs else None
        if 'solution' in globals():
            func = globals()['solution']
        elif 'twoSum' in globals():
            func = globals()['twoSum']
            
        if func:
            result = func(*inputs)
            result_str = result if isinstance(result, str) else json.dumps(result)
            print(result_str)
    except Exception as e:
        print(e, file=sys.stderr)
`;
  }
  return code;
}
