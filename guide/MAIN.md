Below is a non-technical, product-focused MVP plan for Exhibit — an artist-first app for posting, discovering, critiquing, exhibiting, and transacting artwork. It organizes scope, user flows, priorities, launch approach, success metrics, staffing needs, risks and mitigations, and next steps so the team can validate and build quickly without getting lost in implementation details.

Summary goal

Deliver a lean but complete product that demonstrates the core value: beautiful presentation of art + creator-first portfolio + community curation (exhibitions & critique) + simple commerce/commission paths — all without an algorithmic “feed” that buries creators’ work.
Target users / personas

Artist (emerging & professional): posts high-fidelity work, builds a portfolio, applies to shows, accepts commissions.
Collector / Buyer: discovers work, follows artists, purchases originals or commissions.
Critic / Mentor: gives structured feedback and annotations, runs critique groups.
Casual Visitor: browses curated exhibitions and chronological feed, saves favorites.
MVP scope (must-have vs nice-to-have)

Must-have (MVP)
Accounts & Profiles
Basic sign-up (email + social login optional).
Artist profile page: avatar, short bio, location (optional), links (website/social), pinned pieces, portfolio grid.
Simple verification process for artists (manual review + verification badge for early creators).
High-fidelity Artwork Posting & Presentation
Lossless/high-res uploads (support common image formats).
Post metadata: title, year, medium, dimensions, short description, tags, licensing preference, price/for-sale toggle.
Lightbox viewer with zoom and full-bleed viewing for single-art pages.
Portfolios
Artist page aggregates posts; ability to curate (pin 3–6 featured works) and create one custom collection (e.g., “Showcase”).
Chronological & Curated Feeds
Main chronological feed (algorithm-free) showing followed artists and global chronological feed.
A separate “Curated” feed (editor picks / staff-curated) to surface higher-quality works and exhibitions.
Exhibitions & Themed Shows
Ability to create an exhibition page (title, curator, description, start/end dates, list of works).
Curated shows created by staff/curators; submission flow for artists to apply to a show (simple form + selected upload link).
Commission & Marketplace (basic)
Commission request flow: visitor sends a commission request form to an artist (scope, budget, timeline).
Simple “Buy” action for available prints/originals that opens a purchase request/checkout flow (integrated with payment provider).
Platform fee displayed clearly (e.g., “Platform fee: X%”).
Built-in Critique Tools (baseline)
Ability to request critique on a post.
Commenting on posts with both freeform comments and structured feedback templates (e.g., Composition, Color, Technique, Suggestions).
Basic annotation: allow critics to drop markers on the image and leave a brief note (visual anchoring).
Safe-space toggle for critique posts (only invited reviewers or verified mentors).
Messaging & Notifications
In-app messaging between artists and interested parties (commission messages, buyer inquiries).
Notifications for follows, comments, commission requests, application results.
Moderation & Safety
Terms of Use and content guidelines.
Flagging flow for posts and comments.
Moderator dashboard (manual triage for flagged items).
Privacy & Licensing Controls
Per-post settings: visible to public / followers-only / private, license selection (display-only, CC options, commercial inquiry).
Nice-to-have (deferred from MVP)
Advanced discovery algorithm and personalized feeds.
Complex storefronts, print-on-demand fulfillment.
Multiple portfolio collections per artist (beyond one custom collection).
Escrow-managed payments and full marketplace seller onboarding.
AI-based tagging / style recognition.
Bulk import from third-party platforms (Instagram, ArtStation) — can be a high-priority later.
Reputation scoring algorithm and granular collector ratings.
Core user journeys (step-by-step, non-technical)

Artist: sign-up → post first artwork → set portfolio → apply to an exhibition

Sign up with email, fill profile (bio, links), request verification if desired.
Upload image (title, medium, dimensions), choose licensing, optionally set “for sale” with price.
Pin featured pieces to portfolio.
Browse open exhibitions and submit to one with a short statement + select works.
Receive notification of acceptance/rejection.
Collector: discover → follow → inquire or purchase

Browse chronological feed or curated exhibitions.
Click on a work, view details and artist profile.
Follow artist and save work to favorites.
If listed for sale, click “Buy” and complete purchase flow (or send offer / request).
If interested in a commission, click “Request Commission”, complete the form; artist receives message.
Critic / Mentor: discover critique requests → annotate → submit structured feedback

Filter feed for “Open critique requests” or enter a private critique group.
Open a requested work, toggle annotation mode to place markers and add short notes.
Submit both annotations and structured feedback using the feedback template.
Visitor: browse exhibitions → save favorites

Visit curated exhibition pages, learn about the curator and theme.
Browse works in full-bleed mode and save favorites to personal collection (no sign-up required to browse; sign-up to save).
Acceptance criteria and success metrics (feature-level)

Accounts & Profiles

Acceptance: Users can create accounts, update profiles, and artists can be manually verified. Profiles show pinned works and portfolio.
KPI: Percentage of signed-up artists who complete profile > 60% in first 2 weeks.
High-fidelity Uploads & Presentation

Acceptance: Uploaded images appear in full-bleed viewer with zoom; metadata displays correctly.
KPI: Avg. image load/display fidelity score (qualitative testing), and artist satisfaction NPS ≥ +30 in initial tests.
Portfolios

Acceptance: Artist portfolios show all posts and allow pinning featured works.
KPI: % of artists who pin at least one work within first week > 40%.
Chronological & Curated Feeds

Acceptance: Two feed modes available; users can switch and follow artists.
KPI: Engagement time per session on chronological feed > 4 min.
Exhibitions & Submissions

Acceptance: Curated exhibitions are publishable and artists can submit via form; curators can accept/reject and notify artists.
KPI: # of exhibition submissions and acceptance rate; aim for 50 submissions in first month.
Commissions & Marketplace

Acceptance: Visitors can send commission requests and buy listed works; payments processed.
KPI: Conversion rate from interest to commission request or purchase > 2–5% initially; time-to-first-sale metric.
Critique Tools

Acceptance: Users can request critiques, reviewers can annotate and submit structured feedback.
KPI: % of critique requests that receive at least one constructive annotated response within 72 hours > 30%.
Moderation & Safety

Acceptance: Users can flag content; moderators can resolve flagged items within SLA.
KPI: Average time to resolve flagged items < 24–48 hours initially.
Operational plan (how to run the app early-stage)

Curation: small core team of curators (2–3) to select featured works and run exhibitions.
Moderation: 1–2 community moderators to triage flags, manage appeals, and enforce guidelines.
Customer support: single inbox + templated responses for common issues (payments, verification).
Payments & disputes: simple payment provider and manual reconciliation for disputes in MVP.
Verification: manual onboarding process (artists submit portfolio links and ID or work samples) for early verified badge.
Legal/compliance: baseline Terms of Use, privacy policy, clear copyright and licensing guidance; simple DMCA takedown process.
Go-to-market & launch plan

Phase 1: Pre-launch (4–6 weeks)
Build a landing page with waitlist and three name candidates.
Recruit 50–150 artists (via art schools, local galleries, targeted outreach) and 5 curators for launch exhibitions.
Prepare three curated exhibitions to go live on day one (themed + juried selections).
Phase 2: Invite-only launch (2–4 weeks)
Launch to invited artists and collectors; focus on quality and cough feedback loop.
Run an artist onboarding webinar and collect testimonials.
Phase 3: Public launch
Promote curated exhibitions, PR outreach to art blogs, partner with small galleries, and run targeted social campaigns.
Host weekly art challenges and juried shows to drive repeat visits.
KPIs to measure success (early-stage)

Activation & growth
Signups per week, daily active users (DAU), MRR if subscriptions used.
Creator health
% of artists posting at least once per week, posts per active artist.
Discovery & engagement
Session length, time viewing artworks, saves/bookmarks per session, comments per post.
Commerce
of commission requests, # of completed sales, total GMV (gross merchandise value).
Retention & quality
1-week and 4-week retention rates for artists and collectors.
NPS for artists and collectors.
Moderation & safety
Flags per 1000 posts, resolution time, community-reported satisfaction.
Timeline & milestones (example, non-technical)

Week 0–2: Product definition, wireframes, onboarding flows, curate launch exhibitions, recruit pilot artists.
Week 3–6: Build core posting, portfolios, viewer, bare-bones marketplace/commission flow, critique templates, messaging, and moderation processes.
Week 7–8: Curator workflows, curated feed, exhibitions and submission review process, payment provider integration, verification workflow.
Week 9: Beta testing with initial cohort, fix critical feedback, content seeding.
Week 10: Invite-only launch and marketing kickoff.
Week 12+: Public launch and iterative improvements based on metrics.
Team & roles for MVP

Product owner / manager: product prioritization, curator liaison, KPIs.
Designer / UX: core flows, upload + viewer experience, onboarding screens.
Community & curation lead: curate exhibitions, recruit artists, run jury process.
Community moderator / support: keeps the platform safe, responds to users.
Partnerships / growth: outreach to galleries, art schools, influencers.
Legal / compliance advisor (contractor): terms, IP/licensing guidance. (Engineering staff will be needed for build but the plan above assumes non-technical planning only.)
Risks & mitigations

Low-quality content / spam: Mitigate via invite-only launch, manual verification, strong curation, and moderation.
Payment disputes or fraud: Use established payment provider, manual reconciliation and dispute policy, clear seller terms.
Slow user acquisition: Seed with curated exhibitions and partnerships; incentivize artists via featured placements.
Poor critique culture (harsh/abusive feedback): Enforce critique templates, safe-space toggles, and moderator oversight.
Legal / IP issues: Clear post licensing UI and takedown processes, lawyer-reviewed policies.