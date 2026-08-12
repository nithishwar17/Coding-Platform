const fetch = require('node-fetch');

const code = `import java.lang.reflect.*;
import java.util.*;

class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        String s = String.valueOf(x);
        for(int i=0; i<s.length()/2; i++) {
            if(s.charAt(i) != s.charAt(s.length()-1-i)) return false;
        }
        return true;
    }
}
// --- TEST HARNESS ---
public class Main {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while(scanner.hasNextLine()) {
            sb.append(scanner.nextLine()).append("\\n");
        }
        String json = sb.toString().trim();
        if (json.isEmpty()) return;

        List<String> rawValues = parseJsonValues(json);

        Method[] methods = Solution.class.getDeclaredMethods();
        Method target = null;
        for (Method m : methods) {
            if (m.getName().equals("main")) continue;
            target = m;
            break;
        }

        if (target == null) {
            System.err.println("No suitable method found in Solution class.");
            return;
        }

        Class<?>[] paramTypes = target.getParameterTypes();
        Object[] parsedArgs = new Object[paramTypes.length];

        for (int i = 0; i < paramTypes.length && i < rawValues.size(); i++) {
            parsedArgs[i] = convertValue(rawValues.get(i), paramTypes[i]);
        }

        Solution sol = new Solution();
        Object result = target.invoke(sol, parsedArgs);
        
        System.out.println(serialize(result));
    }

    private static List<String> parseJsonValues(String json) {
        List<String> values = new ArrayList<>();
        json = json.trim();
        if (json.startsWith("{") && json.endsWith("}")) {
            json = json.substring(1, json.length() - 1);
            int braceCount = 0, bracketCount = 0;
            boolean inQuotes = false;
            StringBuilder current = new StringBuilder();
            for (int i = 0; i < json.length(); i++) {
                char c = json.charAt(i);
                if (c == '"' && (i == 0 || json.charAt(i-1) != '\\\\')) inQuotes = !inQuotes;
                else if (!inQuotes) {
                    if (c == '{') braceCount++;
                    else if (c == '}') braceCount--;
                    else if (c == '[') bracketCount++;
                    else if (c == ']') bracketCount--;
                    else if (c == ',' && braceCount == 0 && bracketCount == 0) {
                        String pair = current.toString();
                        int colonIdx = pair.indexOf(':');
                        if(colonIdx != -1) values.add(pair.substring(colonIdx + 1).trim());
                        current.setLength(0);
                        continue;
                    }
                }
                current.append(c);
            }
            if (current.length() > 0) {
                String pair = current.toString();
                int colonIdx = pair.indexOf(':');
                if(colonIdx != -1) values.add(pair.substring(colonIdx + 1).trim());
                else values.add(pair.trim());
            }
        } else {
            values.add(json);
        }
        return values;
    }

    private static Object convertValue(String val, Class<?> type) {
        val = val.trim();
        if (type == int.class || type == Integer.class) return Integer.parseInt(val);
        if (type == double.class || type == Double.class) return Double.parseDouble(val);
        if (type == boolean.class || type == Boolean.class) return Boolean.parseBoolean(val);
        if (type == String.class) {
            if (val.startsWith("\\"") && val.endsWith("\\"")) return val.substring(1, val.length() - 1);
            return val;
        }
        if (type == int[].class) {
            if (val.startsWith("[") && val.endsWith("]")) {
                String inner = val.substring(1, val.length() - 1).trim();
                if (inner.isEmpty()) return new int[0];
                String[] parts = inner.split(",");
                int[] arr = new int[parts.length];
                for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
                return arr;
            }
        }
        return null;
    }

    private static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) return java.util.Arrays.toString((int[]) obj).replaceAll(" ", "");
        if (obj instanceof Object[]) return java.util.Arrays.deepToString((Object[]) obj).replaceAll(" ", "");
        if (obj instanceof String) return "\\"" + obj + "\\"";
        return obj.toString();
    }
}`;

async function test() {
  const res = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: "a4906460ffc3a4c54fcda77bf3f3ff7a",
      clientSecret: "c1e6542c1a46f72f5baa69c2857e666859d3bf92d6d0ddcca1bf73b76602cdcb",
      script: code,
      language: "java",
      versionIndex: "4",
      stdin: '{"x": -121}'
    })
  });
  const data = await res.json();
  console.log(data);
}

test();
