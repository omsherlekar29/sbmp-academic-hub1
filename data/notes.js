/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export const NOTES = {
  EMT268901: [
    { title: 'Assignment 1', file: 'emt-assignment1.pdf', type: 'PDF', size: '3.4 MB' },
    { title: 'Assignment 2', file: 'emt-assignment2.pdf', type: 'PDF', size: '2.8 MB' },
    { title: 'Assignment 3', file: 'emt-assignment3.pdf', type: 'PDF', size: '3.1 MB' },
    { title: 'Half Angle Formulas', file: 'emt-halfangleformulas.pdf', type: 'PDF', size: '1.3 MB' },
    { title: 'Question Bank — Periodical Test 1', file: 'emt-qbpt1.pdf', type: 'PDF', size: '1.6 MB' },
    { title: 'Tutorial 1', file: 'emt-tut1.pdf', type: 'PDF', size: '476 KB' },
    { title: 'Tutorial 2', file: 'emt-tut2.pdf', type: 'PDF', size: '290 KB' },
    { title: 'Tutorial 3', file: 'emt-tut3.pdf', type: 'PDF', size: '270 KB' },
    { title: 'Tutorial 4', file: 'emt-tut4.pdf', type: 'PDF', size: '101 KB' },
    { title: 'Tutorial 5A', file: 'emt-tut5a.pdf', type: 'PDF', size: '506 KB' },
    { title: 'Tutorial 5B', file: 'emt-tut5b.pdf', type: 'PDF', size: '21 KB' },
    { title: 'Tutorial 6', file: 'emt-tut6.pdf', type: 'PDF', size: '231 KB' },
    { title: 'Tutorial 7', file: 'emt-tut7.pdf', type: 'PDF', size: '1.1 MB' }
  ],
  ASC268902: [
    { title: 'Unit 1 — Slides', file: 'asc-unit1.pptx', type: 'PPT' },
    { title: 'Unit 2 — Slides', file: 'asc-unit2.pptx', type: 'PPT' },
    { title: 'Question Bank PT-1 — Unit 1', file: 'asc-qbpt1unit1.docx', type: 'DOC' },
    { title: 'Question Bank PT-1 — Unit 2', file: 'asc-qbpt1unit2.docx', type: 'DOC' }
  ],
  CMS268903: [
    { title: 'Unit 1 — Slides', file: 'cms-unit1.pptx', type: 'PPT' },
    { title: 'Unit 2 — Slides', file: 'cms-unit2.pptx', type: 'PPT' },
    { title: 'Unit 3 — Notes', file: 'cms-unit3.pdf', type: 'PDF' },
    { title: 'Question Bank — PT 1', file: 'cms-qbpt1.pdf', type: 'PDF' },
    { title: 'Question Bank — PT 2', file: 'cms-qbpt2.pdf', type: 'PDF' },
    { title: 'Assignment 1', file: 'cms-assignment1.docx', type: 'DOC' }
  ],
  ENG268904: [
    { title: 'Chapter 1', file: 'eng-ch1.pdf', type: 'PDF' },
    { title: 'Experiment 1', file: 'eng-exp1.pdf', type: 'PDF' },
    { title: 'Experiment 2', file: 'eng-exp2.pdf', type: 'PDF' },
    { title: 'Experiment 3', file: 'eng-exp3.pdf', type: 'PDF' },
    { title: 'Experiment 4', file: 'eng-exp4.pdf', type: 'PDF' },
    { title: 'Experiment 5', file: 'eng-exp5.pdf', type: 'PDF' },
    { title: 'Experiment 6', file: 'eng-exp6.pdf', type: 'PDF' },
    { title: 'Experiment 7', file: 'eng-exp7.pdf', type: 'PDF' }
  ],
  FCS260801: [
    { title: 'Experiment 1', file: 'fcs-exp1.pdf', type: 'PDF', size: '5 MB' },
    { title: 'Experiments 2 to 10', file: 'fcs-2to10.pdf', type: 'PDF', size: '22 MB' }
  ],
  UHV268905: [],
  WSD260802: [
    { title: 'Question Bank — PT 1', file: 'wsd-qbpt1.pdf', type: 'PDF' },
    { title: 'Question Bank — PT 2', file: 'wsd-qbpt2.pdf', type: 'PDF' },
    { title: 'Unit 1 — Notes', file: 'wsd-unit1.pdf', type: 'PDF' },
    { title: 'Unit 2 — Notes', file: 'wsd-unit2.pdf', type: 'PDF' },
    { title: 'CSS — Margins (Slides)', file: 'wsd-cssmargins.pptx', type: 'PPT' },
    { title: 'HTML Forms (Slides)', file: 'wsd-htmlforms.pptx', type: 'PPT' }
  ]
};

export function getAllDownloads(){
  const out = [];
  Object.keys(NOTES).forEach(code => {
    NOTES[code].forEach(n => out.push({ ...n, subject: code }));
  });
  return out;
}