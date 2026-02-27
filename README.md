# Switch2Tech

**Free technology mentorship for career changers, built and founded by [Issa Ajao](https://www.linkedin.com/in/issa-ajao-9b955715/)**

[![Live Platform](https://img.shields.io/badge/Live%20Platform-switch2tech.net-brightgreen)](https://switch2tech.net)
[![Learners](https://img.shields.io/badge/Active%20Learners-700%2B-blue)]()
[![Deployments](https://img.shields.io/badge/Deployments-378-orange)]()
[![Commits](https://img.shields.io/badge/Commits-704-lightgrey)]()

---

## What Is Switch2Tech?

Switch2Tech is a free, community-driven technology mentorship ecosystem serving over **700 active learners** across Africa, the United Kingdom, Canada, and the United States.

The platform provides structured curriculum delivery, mentor assignment and tracking, hands-on project coordination, progress monitoring, and job placement management, entirely free of charge. It has never charged its learners a single fee.

Switch2Tech operates on a **train-the-trainer model**: learners who complete the programme return as mentors, creating a self-sustaining knowledge community designed into the system architecture from the start.

---

## Origin Story

Switch2Tech was founded in **January 2024** by Issa Ajao following CloudCrave Solutions' acquisition of Staunch Technologies Limited in late 2023.

Staunch had operated a commercial technology training programme. Rather than abruptly closing that operation, Issa personally funded the transition of former instructors, paying them while they reoriented from commercial instruction into software development. Once that transition was complete, those same instructors co-founded Switch2Tech as a free community mentorship initiative.

Switch2Tech is structurally, financially, and philosophically distinct from any commercial training operation. It exists entirely to serve learners, not to generate revenue.

---

## Impact

- **700+** active learners on the platform
- Learners across **Nigeria, UK, Canada, and the United States**
- Technology tracks: Cloud Computing, DevOps, Web Development, Mobile Development, Cybersecurity
- Facilitated tech career placements locally and internationally
- **Nigerian Internet Group (NIG) Recognition Award 2025** — for contributions to digital talent development across Africa
- **AI Hackathon Africa 2025** — 203 participants, 35 teams, 18 working AI prototypes produced

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui (Radix UI primitives) |
| Backend / Auth / DB | Supabase (PostgreSQL, Edge Functions, Storage) |
| Client-Side Routing | React Router v6 |
| Server State Management | TanStack React Query |
| Form Handling & Validation | React Hook Form + Zod |
| Charts & Analytics | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |
| Hosting | Vercel |

The platform was initially built in PHP and subsequently migrated to this modern TypeScript stack, a deliberate architectural decision based on scalability requirements, real-time mentorship coordination needs, type safety at scale, and long-term maintainability.

---

## Architecture Overview

```
switch2tech/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Supabase client and utilities
│   ├── context/           # Global state management
│   └── styles/            # Global and component styles
├── supabase/
│   ├── migrations/        # Database schema migrations
│   └── functions/         # Edge functions
├── public/                # Static assets
└── vercel.json            # Deployment configuration
```

---

## Core Platform Features

**Learner Management**
- Structured onboarding and track assignment
- Progress tracking across curriculum modules
- Mentor-learner matching and assignment

**Curriculum Delivery**
- Structured learning paths by technology track
- Module completion tracking
- Resource library and reference materials

**Mentorship Coordination**
- Mentor assignment and scheduling
- Session tracking and feedback
- Train-the-trainer pipeline management

**Community**
- Learner cohort grouping
- Communication tools
- Job placement tracking and announcements

**Admin Dashboard**
- Platform-wide learner count and activity monitoring
- Mentor management
- Cohort and track management

---

## Founder and Lead Developer

This platform was **conceived, architected, and built by Issa Ajao** — Co-Founder of [CloudCrave Solutions](https://www.cloudcraves.com) and founder of Switch2Tech.

Issa holds primary responsibility for:
- All architectural decisions across the platform
- The full technical stack selection and implementation
- Database schema design and Supabase configuration
- Deployment infrastructure and CI/CD via Vercel
- Ongoing platform development and maintenance

CloudCrave Solutions provides infrastructure support and technical resources to Switch2Tech as a community initiative.

---

## Deployment

The platform is live and continuously deployed at **[switch2tech.net](https://switch2tech.net)** via Vercel.

- **378 production deployments** to date
- **704 commits** reflecting sustained, ongoing development
- Automatic deployment on merge to main branch
- Environment: Node.js 18+, React 18

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/CloudcraveAcademy/switch2tech-76f708d3.git
cd switch2tech-76f708d3

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Start the development server
npm run dev
```

**Environment Variables Required:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Requirements:** Node.js 18+

---

## Contributing

Switch2Tech is a community initiative. If you are a developer who has benefited from the platform and wants to contribute to its technical development, please reach out directly via the platform or open an issue.

---

## Links

- **Live Platform:** [switch2tech.net](https://switch2tech.net)
- **AI Hackathon Africa:** [aihackathon.africa](https://aihackathon.africa)
- **CloudCrave Solutions:** [cloudcraves.com](https://www.cloudcraves.com)
- **Founder LinkedIn:** [Issa Ajao](https://www.linkedin.com/in/issa-ajao-9b955715/)

---

*Switch2Tech is a free community initiative. It does not charge learners and is not a commercial product. Founded January 2024. Lagos, Nigeria.*
