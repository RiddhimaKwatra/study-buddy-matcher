# Study Buddy Matcher

A frontend-only web app that helps students find hackathon teammates and study partners outside their own friend circle. Built with plain HTML, CSS and JavaScript. No backend, no install, no API keys.

## Problem
Students who want a teammate for a hackathon, a project or exam prep usually only know people in their own circle. Skills end up duplicated (three coders, no designer) and good teams never form.

## Solution
Students create a profile with their skills, course, goal and weekly free time. The app ranks other students by a compatibility score that rewards complementary skills and shared availability. A team builder shows which roles a team is missing and suggests the best people to fill each gap.

## Run it
Open `index.html` in any modern browser.

## Features
- **Profile:** name, course, year, goal, interest, skills and a weekly free-time grid.
- **Find teammates:** ranked matches with a score out of 100, a 4-part breakdown and plain-English reasons. Filter by goal or skill. Send a request or add to team.
- **Team builder:** choose the roles your project needs, see which are covered or missing, and add suggested students for each gap.
- **Light and dark mode**, responsive layout, keyboard-accessible controls.

## How the matching algorithm works
Score between you (A) and another student (B), out of 100:

| Part | Points | Calculation |
| --- | --- | --- |
| Complementary skills | 40 | Skills only one of you has, divided by all skills across both of you |
| Shared free time | 30 | Overlapping slots divided by the smaller slot count (max 1) |
| Course and goal | 20 | Same course +12, same goal +8 |
| Shared interest | 10 | Same interest |

The team builder uses a set difference: required roles minus the skills covered by the team. For each missing role it ranks students who have that skill using the same score.

## Files
| File | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `style.css` | Styling, light and dark themes, responsive layout |
| `app.js` | Sample students, scoring, rendering, team builder |

## Limits and future work
- Students shown are sample data. Your profile, team and requests are stored in the browser's localStorage.
- A real deployment would use a backend (Firebase or Supabase) with campus login so profiles are shared across students.
- Future ideas: in-app messaging, request approval, hackathon-specific team size limits, and skill levels instead of yes/no.
