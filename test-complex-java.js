const fetch = require('node-fetch');

const code = `import java.lang.reflect.*;
import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        return Arrays.asList(Arrays.asList("bat"), Arrays.asList("nat", "tan"), Arrays.asList("ate", "eat", "tea"));
    }
    
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        dummy.next = list1;
        return dummy.next; // Just a dummy test
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

        Type[] paramTypes = target.getGenericParameterTypes();
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
            json = json.substring(1, json.length() - 1).trim();
            if (json.isEmpty()) return values;
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
    
    private static List<String> parseJsonArray(String val) {
        List<String> elements = new ArrayList<>();
        val = val.trim();
        if (val.startsWith("[") && val.endsWith("]")) {
            val = val.substring(1, val.length() - 1).trim();
            if (val.isEmpty()) return elements;
            int braceCount = 0, bracketCount = 0;
            boolean inQuotes = false;
            StringBuilder current = new StringBuilder();
            for (int i = 0; i < val.length(); i++) {
                char c = val.charAt(i);
                if (c == '"' && (i == 0 || val.charAt(i-1) != '\\\\')) inQuotes = !inQuotes;
                else if (!inQuotes) {
                    if (c == '{') braceCount++;
                    else if (c == '}') braceCount--;
                    else if (c == '[') bracketCount++;
                    else if (c == ']') bracketCount--;
                    else if (c == ',' && braceCount == 0 && bracketCount == 0) {
                        elements.add(current.toString().trim());
                        current.setLength(0);
                        continue;
                    }
                }
                current.append(c);
            }
            if (current.length() > 0) {
                elements.add(current.toString().trim());
            }
        }
        return elements;
    }

    private static Object convertValue(String val, Type type) throws Exception {
        val = val.trim();
        if (val.equals("null")) return null;
        
        if (type instanceof Class<?>) {
            Class<?> clazz = (Class<?>) type;
            if (clazz == int.class || clazz == Integer.class) return Integer.parseInt(val);
            if (clazz == double.class || clazz == Double.class) return Double.parseDouble(val);
            if (clazz == boolean.class || clazz == Boolean.class) return Boolean.parseBoolean(val);
            if (clazz == String.class) {
                if (val.startsWith("\\"") && val.endsWith("\\"")) return val.substring(1, val.length() - 1);
                return val;
            }
            if (clazz == int[].class) {
                List<String> elems = parseJsonArray(val);
                int[] arr = new int[elems.size()];
                for (int i = 0; i < elems.size(); i++) arr[i] = Integer.parseInt(elems.get(i));
                return arr;
            }
            if (clazz == String[].class) {
                List<String> elems = parseJsonArray(val);
                String[] arr = new String[elems.size()];
                for (int i = 0; i < elems.size(); i++) {
                    String s = elems.get(i);
                    if (s.startsWith("\\"") && s.endsWith("\\"")) s = s.substring(1, s.length() - 1);
                    arr[i] = s;
                }
                return arr;
            }
            if (clazz == ListNode.class) {
                List<String> elems = parseJsonArray(val);
                ListNode dummy = new ListNode(0);
                ListNode curr = dummy;
                for (String e : elems) {
                    curr.next = new ListNode(Integer.parseInt(e));
                    curr = curr.next;
                }
                return dummy.next;
            }
        } else if (type instanceof ParameterizedType) {
            ParameterizedType pType = (ParameterizedType) type;
            Type rawType = pType.getRawType();
            if (rawType instanceof Class<?> && List.class.isAssignableFrom((Class<?>) rawType)) {
                Type typeArg = pType.getActualTypeArguments()[0];
                List<String> elems = parseJsonArray(val);
                List<Object> list = new ArrayList<>();
                for (String e : elems) {
                    list.add(convertValue(e, typeArg));
                }
                return list;
            }
        }
        return null;
    }

    private static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof Integer || obj instanceof Double || obj instanceof Boolean) return obj.toString();
        if (obj instanceof String) return "\\"" + obj + "\\"";
        if (obj instanceof int[]) {
            int[] arr = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for(int i=0; i<arr.length; i++) {
                sb.append(arr[i]);
                if(i < arr.length-1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof String[]) {
            String[] arr = (String[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for(int i=0; i<arr.length; i++) {
                sb.append("\\"").append(arr[i]).append("\\"");
                if(i < arr.length-1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for(int i=0; i<list.size(); i++) {
                sb.append(serialize(list.get(i)));
                if(i < list.size()-1) sb.append(",");
            }
            return sb.append("]").toString();
        }
        if (obj instanceof ListNode) {
            ListNode curr = (ListNode) obj;
            StringBuilder sb = new StringBuilder("[");
            while (curr != null) {
                sb.append(curr.val);
                if (curr.next != null) sb.append(",");
                curr = curr.next;
            }
            return sb.append("]").toString();
        }
        return obj.toString();
    }
}`;

async function test(method, stdin) {
  const codeToRun = code.replace(/Method target = null;\s*for \(Method m : methods\) {\s*if \(m.getName\(\).equals\("main"\)\) continue;\s*target = m;\s*break;\s*}/, 
    \`Method target = null;
    for (Method m : methods) {
        if (m.getName().equals("\${method}")) {
            target = m;
            break;
        }
    }\`);

  const res = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: "a4906460ffc3a4c54fcda77bf3f3ff7a",
      clientSecret: "c1e6542c1a46f72f5baa69c2857e666859d3bf92d6d0ddcca1bf73b76602cdcb",
      script: codeToRun,
      language: "java",
      versionIndex: "4",
      stdin: stdin
    })
  });
  const data = await res.json();
  console.log(\`Test \${method} Output:\`, data);
}

async function run() {
    await test("groupAnagrams", JSON.stringify({ strs: ["eat","tea","tan","ate","nat","bat"] }));
    await test("mergeTwoLists", JSON.stringify({ list1: [1,2,4], list2: [1,3,4] }));
}
run();
