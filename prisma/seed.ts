import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const problems = [
  // EASY
  {
    title: "1. Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    tags: "Array,Hash Table",
    testCases: [
      { input: JSON.stringify({ nums: [2,7,11,15], target: 9 }), expectedOutput: JSON.stringify([0,1]), isHidden: false },
      { input: JSON.stringify({ nums: [3,2,4], target: 6 }), expectedOutput: JSON.stringify([1,2]), isHidden: false },
      { input: JSON.stringify({ nums: [3,3], target: 6 }), expectedOutput: JSON.stringify([0,1]), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function twoSum(nums, target) {\n  \n}",
      typescript: "function twoSum(nums: number[], target: number): number[] {\n  \n}",
      python: "def twoSum(nums: list[int], target: int) -> list[int]:\n    ",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      go: "func twoSum(nums []int, target int) []int {\n    \n}",
      rust: "impl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        \n    }\n}"
    })
  },
  {
    title: "13. Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    tags: "String,Stack",
    testCases: [
      { input: JSON.stringify({ s: "()" }), expectedOutput: JSON.stringify(true), isHidden: false },
      { input: JSON.stringify({ s: "()[]{}" }), expectedOutput: JSON.stringify(true), isHidden: false },
      { input: JSON.stringify({ s: "(]" }), expectedOutput: JSON.stringify(false), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function isValid(s) {\n  \n}",
      typescript: "function isValid(s: string): boolean {\n  \n}",
      python: "def isValid(s: str) -> bool:\n    ",
      java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}"
    })
  },
  {
    title: "121. Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    tags: "Array,Dynamic Programming",
    testCases: [
      { input: JSON.stringify({ prices: [7,1,5,3,6,4] }), expectedOutput: JSON.stringify(5), isHidden: false },
      { input: JSON.stringify({ prices: [7,6,4,3,1] }), expectedOutput: JSON.stringify(0), isHidden: false },
      { input: JSON.stringify({ prices: [1] }), expectedOutput: JSON.stringify(0), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function maxProfit(prices) {\n  \n}",
      typescript: "function maxProfit(prices: number[]): number {\n  \n}",
      python: "def maxProfit(prices: list[int]) -> int:\n    ",
      java: "class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}"
    })
  },
  {
    title: "217. Contains Duplicate",
    difficulty: "Easy",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    tags: "Array,Hash Table,Sorting",
    testCases: [
      { input: JSON.stringify({ nums: [1,2,3,1] }), expectedOutput: JSON.stringify(true), isHidden: false },
      { input: JSON.stringify({ nums: [1,2,3,4] }), expectedOutput: JSON.stringify(false), isHidden: false },
      { input: JSON.stringify({ nums: [1,1,1,3,3,4,3,2,4,2] }), expectedOutput: JSON.stringify(true), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function containsDuplicate(nums) {\n  \n}",
      typescript: "function containsDuplicate(nums: number[]): boolean {\n  \n}",
      python: "def containsDuplicate(nums: list[int]) -> bool:\n    ",
      java: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}"
    })
  },
  {
    title: "53. Maximum Subarray",
    difficulty: "Easy",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    tags: "Array,Divide and Conquer,Dynamic Programming",
    testCases: [
      { input: JSON.stringify({ nums: [-2,1,-3,4,-1,2,1,-5,4] }), expectedOutput: JSON.stringify(6), isHidden: false },
      { input: JSON.stringify({ nums: [1] }), expectedOutput: JSON.stringify(1), isHidden: false },
      { input: JSON.stringify({ nums: [5,4,-1,7,8] }), expectedOutput: JSON.stringify(23), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function maxSubArray(nums) {\n  \n}",
      typescript: "function maxSubArray(nums: number[]): number {\n  \n}",
      python: "def maxSubArray(nums: list[int]) -> int:\n    ",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}"
    })
  },
  {
    title: "21. Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    tags: "Linked List,Recursion",
    testCases: [
      { input: JSON.stringify({ list1: [1,2,4], list2: [1,3,4] }), expectedOutput: JSON.stringify([1,1,2,3,4,4]), isHidden: false },
      { input: JSON.stringify({ list1: [], list2: [] }), expectedOutput: JSON.stringify([]), isHidden: false },
      { input: JSON.stringify({ list1: [], list2: [0] }), expectedOutput: JSON.stringify([0]), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function mergeTwoLists(list1, list2) {\n  \n}",
      typescript: "function mergeTwoLists(list1: any, list2: any): any {\n  \n}",
      python: "def mergeTwoLists(list1, list2):\n    ",
      java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}"
    })
  },

  // MEDIUM
  {
    title: "3. Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Given a string `s`, find the length of the longest substring without repeating characters.",
    tags: "Hash Table,String,Sliding Window",
    testCases: [
      { input: JSON.stringify({ s: "abcabcbb" }), expectedOutput: JSON.stringify(3), isHidden: false },
      { input: JSON.stringify({ s: "bbbbb" }), expectedOutput: JSON.stringify(1), isHidden: false },
      { input: JSON.stringify({ s: "pwwkew" }), expectedOutput: JSON.stringify(3), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function lengthOfLongestSubstring(s) {\n  \n}",
      typescript: "function lengthOfLongestSubstring(s: string): number {\n  \n}",
      python: "def lengthOfLongestSubstring(s: str) -> int:\n    ",
      java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}"
    })
  },
  {
    title: "15. 3Sum",
    difficulty: "Medium",
    description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
    tags: "Array,Two Pointers,Sorting",
    testCases: [
      { input: JSON.stringify({ nums: [-1,0,1,2,-1,-4] }), expectedOutput: JSON.stringify([[-1,-1,2],[-1,0,1]]), isHidden: false },
      { input: JSON.stringify({ nums: [0,1,1] }), expectedOutput: JSON.stringify([]), isHidden: false },
      { input: JSON.stringify({ nums: [0,0,0] }), expectedOutput: JSON.stringify([[0,0,0]]), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function threeSum(nums) {\n  \n}",
      typescript: "function threeSum(nums: number[]): number[][] {\n  \n}",
      python: "def threeSum(nums: list[int]) -> list[list[int]]:\n    ",
      java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        \n    }\n}"
    })
  },
  {
    title: "49. Group Anagrams",
    difficulty: "Medium",
    description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    tags: "Array,Hash Table,String,Sorting",
    testCases: [
      { input: JSON.stringify({ strs: ["eat","tea","tan","ate","nat","bat"] }), expectedOutput: JSON.stringify([["bat"],["nat","tan"],["ate","eat","tea"]]), isHidden: false },
      { input: JSON.stringify({ strs: [""] }), expectedOutput: JSON.stringify([[""]]), isHidden: false },
      { input: JSON.stringify({ strs: ["a"] }), expectedOutput: JSON.stringify([["a"]]), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function groupAnagrams(strs) {\n  \n}",
      typescript: "function groupAnagrams(strs: string[]): string[][] {\n  \n}",
      python: "def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    ",
      java: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}"
    })
  },
  {
    title: "238. Product of Array Except Self",
    difficulty: "Medium",
    description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
    tags: "Array,Prefix Sum",
    testCases: [
      { input: JSON.stringify({ nums: [1,2,3,4] }), expectedOutput: JSON.stringify([24,12,8,6]), isHidden: false },
      { input: JSON.stringify({ nums: [-1,1,0,-3,3] }), expectedOutput: JSON.stringify([0,0,9,0,0]), isHidden: false },
      { input: JSON.stringify({ nums: [1,1] }), expectedOutput: JSON.stringify([1,1]), isHidden: true }
    ],
    starterCode: JSON.stringify({
      javascript: "function productExceptSelf(nums) {\n  \n}",
      typescript: "function productExceptSelf(nums: number[]): number[] {\n  \n}",
      python: "def productExceptSelf(nums: list[int]) -> list[int]:\n    ",
      java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}"
    })
  }
];

async function main() {
  console.log("Start seeding problems...");
  for (const p of problems) {
    const existing = await prisma.problem.findFirst({
      where: { title: p.title }
    });

    if (existing) {
      await prisma.problem.update({
        where: { id: existing.id },
        data: {
          difficulty: p.difficulty,
          description: p.description,
          tags: p.tags,
          starterCode: p.starterCode
        }
      });
      await prisma.testCase.deleteMany({ where: { problemId: existing.id } });
      await prisma.testCase.createMany({
        data: p.testCases.map(tc => ({
          ...tc,
          problemId: existing.id
        }))
      });
      console.log(`Updated: ${p.title}`);
    } else {
      await prisma.problem.create({
        data: {
          title: p.title,
          difficulty: p.difficulty,
          description: p.description,
          tags: p.tags,
          starterCode: p.starterCode,
          testCases: {
            create: p.testCases
          }
        }
      });
      console.log(`Seeded: ${p.title}`);
    }
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
