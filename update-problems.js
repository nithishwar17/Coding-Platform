const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.problem.update({
    where: { id: 1 }, // Two Sum
    data: {
      constraints: "<ul><li><code>2 <= nums.length <= 10^4</code></li><li><code>-10^9 <= nums[i] <= 10^9</code></li><li><code>-10^9 <= target <= 10^9</code></li><li><strong>Only one valid answer exists.</strong></li></ul>",
      hints: "<ul><li>A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.</li><li>So, if we fix one of the numbers, say `x`, we have to scan the entire array to find the next number `y` which is `value - x` where value is the input parameter. Can we change our array keeping a track of any elements in such a way that we can find `y` in O(1) time?</li><li>The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?</li></ul>",
      companies: "Amazon, Google, Apple, Adobe, Microsoft"
    }
  });

  await prisma.problem.update({
    where: { id: 9 }, // Palindrome Number
    data: {
      constraints: "<ul><li><code>-2^31 <= x <= 2^31 - 1</code></li></ul>",
      hints: "<ul><li>Beware of overflow when you reverse the integer.</li><li>Could you solve it without converting the integer to a string?</li></ul>",
      companies: "Facebook, Amazon, Microsoft"
    }
  });

  await prisma.problem.update({
    where: { id: 20 }, // Valid Parentheses
    data: {
      constraints: "<ul><li><code>1 <= s.length <= 10^4</code></li><li><code>s</code> consists of parentheses only <code>'()[]{}'</code>.</li></ul>",
      hints: "<ul><li>Use a stack of characters.</li><li>When you encounter an opening bracket, push it to the top of the stack.</li><li>When you encounter a closing bracket, check if the top of the stack was the opening for it. If so, pop it from the stack. Otherwise, return false.</li></ul>",
      companies: "LinkedIn, Amazon, Facebook"
    }
  });

  await prisma.problem.update({
    where: { id: 49 }, // Group Anagrams
    data: {
      constraints: "<ul><li><code>1 <= strs.length <= 10^4</code></li><li><code>0 <= strs[i].length <= 100</code></li><li><code>strs[i]</code> consists of lowercase English letters.</li></ul>",
      hints: "<ul><li>Two strings are anagrams if and only if their sorted strings are equal.</li><li>Two strings are anagrams if and only if their character counts (respective number of occurrences of each character) are the same.</li></ul>",
      companies: "Amazon, Microsoft, eBay, Facebook"
    }
  });

  console.log("Problems updated with constraints, hints, and companies.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
