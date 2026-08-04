import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_PROBLEMS = [
  {
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
    tags: "Math",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number} x\n * @return {boolean}\n */\nfunction isPalindrome(x) {\n  \n}",
      python: "def isPalindrome(x: int) -> bool:\n    pass"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ x: 121 }), expectedOutput: JSON.stringify(true) },
        { input: JSON.stringify({ x: -121 }), expectedOutput: JSON.stringify(false) },
        { input: JSON.stringify({ x: 10 }), expectedOutput: JSON.stringify(false) }
      ]
    }
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    tags: "Linked List, Recursion",
    starterCode: JSON.stringify({
      javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nfunction mergeTwoLists(list1, list2) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ list1: [1,2,4], list2: [1,3,4] }), expectedOutput: JSON.stringify([1,1,2,3,4,4]) }
      ]
    }
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    tags: "String, Stack",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ s: "()" }), expectedOutput: JSON.stringify(true) },
        { input: JSON.stringify({ s: "()[]{}" }), expectedOutput: JSON.stringify(true) },
        { input: JSON.stringify({ s: "(]" }), expectedOutput: JSON.stringify(false) }
      ]
    }
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    tags: "Array, Divide and Conquer, Dynamic Programming",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ nums: [-2,1,-3,4,-1,2,1,-5,4] }), expectedOutput: JSON.stringify(6) },
        { input: JSON.stringify({ nums: [1] }), expectedOutput: JSON.stringify(1) },
        { input: JSON.stringify({ nums: [5,4,-1,7,8] }), expectedOutput: JSON.stringify(23) }
      ]
    }
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    tags: "Math, Dynamic Programming, Memoization",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ n: 2 }), expectedOutput: JSON.stringify(2) },
        { input: JSON.stringify({ n: 3 }), expectedOutput: JSON.stringify(3) }
      ]
    }
  },
  {
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    description: "There is an integer array `nums` sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (0-indexed). For example, `[0,1,2,4,5,6,7]` might be rotated at pivot index 3 and become `[4,5,6,7,0,1,2]`.\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    tags: "Array, Binary Search",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ nums: [4,5,6,7,0,1,2], target: 0 }), expectedOutput: JSON.stringify(4) },
        { input: JSON.stringify({ nums: [4,5,6,7,0,1,2], target: 3 }), expectedOutput: JSON.stringify(-1) }
      ]
    }
  },
  {
    title: "Contains Duplicate",
    difficulty: "Easy",
    description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    tags: "Array, Hash Table, Sorting",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number[]} nums\n * @return {boolean}\n */\nfunction containsDuplicate(nums) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ nums: [1,2,3,1] }), expectedOutput: JSON.stringify(true) },
        { input: JSON.stringify({ nums: [1,2,3,4] }), expectedOutput: JSON.stringify(false) },
        { input: JSON.stringify({ nums: [1,1,1,3,3,4,3,2,4,2] }), expectedOutput: JSON.stringify(true) }
      ]
    }
  },
  {
    title: "Product of Array Except Self",
    difficulty: "Medium",
    description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.",
    tags: "Array, Prefix Sum",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction productExceptSelf(nums) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ nums: [1,2,3,4] }), expectedOutput: JSON.stringify([24,12,8,6]) },
        { input: JSON.stringify({ nums: [-1,1,0,-3,3] }), expectedOutput: JSON.stringify([0,0,9,0,0]) }
      ]
    }
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    description: "Suppose an array of length `n` sorted in ascending order is rotated between `1` and `n` times. For example, the array `nums = [0,1,2,4,5,6,7]` might become:\n- `[4,5,6,7,0,1,2]` if it was rotated 4 times.\n- `[0,1,2,4,5,6,7]` if it was rotated 7 times.\n\nNotice that rotating an array `[a[0], a[1], a[2], ..., a[n-1]]` 1 time results in the array `[a[n-1], a[0], a[1], a[2], ..., a[n-2]]`.\n\nGiven the sorted rotated array `nums` of unique elements, return the minimum element of this array.\n\nYou must write an algorithm that runs in `O(log n)` time.",
    tags: "Array, Binary Search",
    starterCode: JSON.stringify({
      javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction findMin(nums) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ nums: [3,4,5,1,2] }), expectedOutput: JSON.stringify(1) },
        { input: JSON.stringify({ nums: [4,5,6,7,0,1,2] }), expectedOutput: JSON.stringify(0) },
        { input: JSON.stringify({ nums: [11,13,15,17] }), expectedOutput: JSON.stringify(11) }
      ]
    }
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    tags: "Linked List, Recursion",
    starterCode: JSON.stringify({
      javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n  \n}"
    }),
    testCases: {
      create: [
        { input: JSON.stringify({ head: [1,2,3,4,5] }), expectedOutput: JSON.stringify([5,4,3,2,1]) }
      ]
    }
  }
];

async function main() {
  console.log("Seeding problems...");
  const createdProblems = [];
  for (const problem of NEW_PROBLEMS) {
    const p = await prisma.problem.create({
      data: problem
    });
    createdProblems.push(p);
  }
  console.log(`Added ${createdProblems.length} new problems.`);

  console.log("Seeding activity (submissions)...");
  
  // Get all users
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found to seed activity for.");
    return;
  }
  
  // Get all problems to randomly pick from
  const allProblems = await prisma.problem.findMany();
  
  let totalSubmissions = 0;
  
  for (const user of users) {
    // Generate between 50 and 200 submissions per user
    const numSubmissions = Math.floor(Math.random() * 150) + 50;
    const userSubmissions = [];
    
    // Spread over last 100 days
    const now = new Date();
    
    for (let i = 0; i < numSubmissions; i++) {
      const daysAgo = Math.floor(Math.random() * 100);
      const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (Math.random() * 24 * 60 * 60 * 1000));
      
      const problem = allProblems[Math.floor(Math.random() * allProblems.length)];
      const isAccepted = Math.random() > 0.3; // 70% acceptance rate
      
      userSubmissions.push({
        userId: user.id,
        problemId: problem.id,
        code: "// some dummy code",
        language: "javascript",
        status: isAccepted ? "Accepted" : "Wrong Answer",
        executionTime: Math.random() * 100,
        memoryKb: Math.random() * 20000 + 10000,
        createdAt: date
      });
    }
    
    // Insert submissions in batches
    await prisma.submission.createMany({
      data: userSubmissions
    });
    
    totalSubmissions += numSubmissions;
    
    // Update user XP and streak based on submissions
    const acceptedCount = userSubmissions.filter(s => s.status === "Accepted").length;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: acceptedCount * 10 },
        streak: Math.floor(Math.random() * 15) // Random streak up to 15
      }
    });
  }
  
  console.log(`Successfully added ${totalSubmissions} submissions across ${users.length} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
