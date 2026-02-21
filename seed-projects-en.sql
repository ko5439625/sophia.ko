-- English version of projects
-- Simplified translations of key projects

INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko', 'en', 'ai-jira-bug-reporting', 'AI-Powered JIRA Bug Reporting System', 'project',
'Streamlit-based mirroring site developed to resolve slow JIRA Cloud access and connection errors. Integrates RAG-based AI auto-bug writing while enabling fast local JIRA data queries.',
'Addressing JIRA Cloud access issues: slow speed and frequent connection failures experienced by entire team. Long wait times for bug registration and frequent access failures. Starting point: mirror site planning → registration standardization → convenience',
ARRAY['Python', 'Streamlit', 'OpenAI API', 'JIRA REST API', 'Chroma DB', 'OpenAI Embedding'],
1,
jsonb_build_object(
  'key_features', jsonb_build_array(
    'JIRA Cloud mirroring (fast queries)',
    'Mirror → JIRA auto-sync (bug registration)',
    'RAG-based auto bug writing',
    'Component-based pattern analysis',
    'Vector search with Chroma DB + OpenAI Embedding hybrid',
    'Project context injection'
  ),
  'achievements', jsonb_build_array(
    'AI accuracy maintained at ~85% (15% edit rate)',
    'In use by team, awaiting deployment to other projects via infra team',
    'Knowledge Base: 3,000 bugs analyzed → component-based keyword/repro steps/expected results patterns',
    'Few-shot Learning: 20 team bugs analyzed → writing style/tone/format extraction'
  )
)
);

INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko', 'en', 'excel-diff-viewer', 'Excel Diff Viewer (GGM-Diff / heungum)', 'project',
'QA-specialized tool for visually comparing changes between revisions of Excel table files managed in Perforce. Replaces Beyond Compare and is used dozens of times daily.',
'P4V default Diff: Excel is binary, practical comparison impossible. Beyond Compare: not allowed by company policy. Manual comparison: 10-20 min per file, human error prone',
ARRAY['Python', 'CustomTkinter', 'openpyxl', 'pandas', 'PyInstaller', 'Perforce p4python'],
2,
jsonb_build_object(
  'key_features', jsonb_build_array(
    'Perforce auto-integration (p4python)',
    'File tree and search',
    'Revision history viewing',
    '2-Way Diff comparison (key column based)',
    'Color highlighting (add: green, delete: red, modify: yellow)',
    'View changes only / view all toggle',
    'Excel export',
    'Collapse/expand features',
    'Sheet selection',
    'Auto key column detection + manual override'
  ),
  'achievements', jsonb_build_array(
    'Verification time: 10-20 min → 1 min per file (90% reduction)',
    'Accuracy: 100% (human error eliminated)',
    'Daily file processing capacity: 3x increase',
    'Beyond Compare replacement (cost savings)',
    'Shared company-wide via WIKI documentation'
  ),
  'usage', 'Projects: Hoyeon(BSS), BSH(Breakers), AION2 / Used dozens of times daily'
)
);

INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'en', 'bm-table-validation', 'BM Table Validation & Probability Verification Automation', 'project',
'Extension feature of Excel Diff Viewer that automates BM (Business Model) table data validation and probability item verification.',
NULL,
ARRAY['Python', 'openpyxl', 'pandas'],
3,
jsonb_build_object(
  'key_features', jsonb_build_array(
    'Planning doc (Excel) vs table comparison',
    'Probability sum 100% verification',
    'UI highlighting',
    'API call website box item probability check',
    'Grade-based probability distribution analysis',
    'JIRA issue registration on mismatch'
  ),
  'achievements', 'Proven necessity when incorrect values went live / Eliminated manual verification omission/error risks'
)
);

INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'en', 'qa-methodology', 'Game QA Methodology & Process (Efficiency-focused)', 'methodology',
'QA methodology focused on efficiency/infrastructure/automation/process standardization rather than in-game QA.',
NULL,
ARRAY['Data Analysis', 'Process Design', 'Automation'],
7,
jsonb_build_object(
  'methodologies', jsonb_build_object(
    'Log-based QA', 'User progress/churn point data analysis / Data-driven content improvement proposals',
    'SET Team Collaboration', 'Boss reward drop report system / Customer reports reduced from 5-10/month → 0 (full automation)',
    'Probability Verification', 'API log-based probability data extraction → automated verification',
    'Launch QA Experience', 'FGT execution / Regular maintenance QA / ESG verification / iOS/AOS platform review process documentation'
  ),
  'philosophy', 'QA core goal = not "perfect quality" but "cost-efficiency optimized quality assurance" / Right quality at right time maximizes profit',
  'ai_tools', 'GPT-based checklist auto-generation: planning doc → GPT analysis → checklist / 5 hours → 1 hour (80% reduction)'
)
);

INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko', 'en', 'ai-qa-vision', 'Vision: AI × QA Future', 'vision',
'AI-powered QA has already begun. The tools built so far are the first steps toward a future where AI permeates the entire QA process.',
15,
jsonb_build_object(
  'vision_directions', jsonb_build_array(
    'Expand AI-based QA automation: Bug discovery → pattern analysis → registration → reporting → documentation in one pipeline',
    'AI auto test case generation: Auto-update test cases on planning changes, AI suggests coverage gaps',
    'AI bug prediction / early detection: Auto impact analysis + potential bug prediction on code/table changes',
    'AI-enhanced QA tools: Tools connected via AI sharing context',
    'AI-powered QA process standardization: AI auto-designs QA systems for new projects'
  ),
  'key_message', 'AI-powered QA has already begun. Bug registration automation, table verification, probability verification, checklist generation — these are not individual solutions, but the first steps of AI permeating all of QA. The next step is connecting these tools, enabling AI to judge "what needs verification", allowing QA engineers to focus on truly critical decisions.'
)
);
