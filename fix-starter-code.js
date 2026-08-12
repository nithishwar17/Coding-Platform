const { PrismaClient } = require('@prisma/client');
const { LeetCode } = require('leetcode-query');

const prisma = new PrismaClient();
const lc = new LeetCode();

function getTitleSlug(title) {
    // Remove special characters, replace spaces with hyphens, convert to lowercase
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

async function main() {
    console.log("Starting starter code update...");
    const problems = await prisma.problem.findMany();
    
    let updatedCount = 0;
    
    // Process in smaller batches to avoid overwhelming the LeetCode API
    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        
        // Skip problems that don't have the generic "solve(String input)" 
        // to avoid unnecessary API calls if they are already fixed.
        if (p.starterCode && !p.starterCode.includes("solve(String input)")) {
            continue;
        }

        const slug = getTitleSlug(p.title);
        try {
            const lcProblem = await lc.problem(slug);
            if (lcProblem && lcProblem.codeSnippets) {
                const starterCode = {};
                lcProblem.codeSnippets.forEach(s => {
                    if (s.langSlug === 'python3') starterCode['python'] = s.code;
                    if (s.langSlug === 'java') starterCode['java'] = s.code;
                    if (s.langSlug === 'javascript') starterCode['javascript'] = s.code;
                    if (s.langSlug === 'cpp') starterCode['cpp'] = s.code;
                });

                if (Object.keys(starterCode).length > 0) {
                    await prisma.problem.update({
                        where: { id: p.id },
                        data: { starterCode: JSON.stringify(starterCode) }
                    });
                    updatedCount++;
                    console.log(`[${i+1}/${problems.length}] Updated starter code for: ${p.title}`);
                } else {
                     console.log(`[${i+1}/${problems.length}] No relevant code snippets for: ${p.title}`);
                }
            } else {
                console.log(`[${i+1}/${problems.length}] Could not find code snippets for: ${p.title} (Slug: ${slug})`);
            }
        } catch (err) {
            console.error(`[${i+1}/${problems.length}] Error fetching ${p.title}:`, err.message);
        }
        
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Finished! Updated starter code for ${updatedCount} problems.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
