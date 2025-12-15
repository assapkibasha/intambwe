import React, { useState, useEffect } from 'react';

const TraineeAssessmentReport = () => {
  const [studentId, setStudentId] = useState('');
  const [academicYear, setAcademicYear] = useState('2023/24');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Mock data - replace with actual API call
  const mockData = {
    student: {
      std_id: 1,
      std_fname: 'Jean',
      std_mname: 'Claude',
      std_lname: 'MUGABO',
      admission_number: 'SWD/2023/001',
      Class: {
        class_id: 1,
        class_name: 'Level 3 Software Development',
        trade_id: 1
      }
    },
    marks: [
      // Core Specific
      { sbj_id: 1, Subject: { sbj_code: 'SWD/WJ301', sbj_name: 'Develop website', sbj_credit: 12 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 45, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 1, Subject: { sbj_code: 'SWD/WJ301', sbj_name: 'Develop website', sbj_credit: 12 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 48, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 1, Subject: { sbj_code: 'SWD/WJ301', sbj_name: 'Develop website', sbj_credit: 12 }, 
        cat_1: 17, cat_2: 20, cat_3: 19, exam: 50, semester: 'Term 3', ac_year: '2023/24' },
      
      { sbj_id: 2, Subject: { sbj_code: 'SWD/SJ301', sbj_name: 'Apply JavaScript', sbj_credit: 12 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 42, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 2, Subject: { sbj_code: 'SWD/SJ301', sbj_name: 'Apply JavaScript', sbj_credit: 12 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 45, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 2, Subject: { sbj_code: 'SWD/SJ301', sbj_name: 'Apply JavaScript', sbj_credit: 12 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 47, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 3, Subject: { sbj_code: 'SWD/CJ301', sbj_name: 'Conduct Version Control', sbj_credit: 8 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 48, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 3, Subject: { sbj_code: 'SWD/CJ301', sbj_name: 'Conduct Version Control', sbj_credit: 8 }, 
        cat_1: 17, cat_2: 20, cat_3: 19, exam: 50, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 3, Subject: { sbj_code: 'SWD/CJ301', sbj_name: 'Conduct Version Control', sbj_credit: 8 }, 
        cat_1: 18, cat_2: 20, cat_3: 19, exam: 52, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 4, Subject: { sbj_code: 'SWD/PJ301', sbj_name: 'Analyse project requirements', sbj_credit: 8 }, 
        cat_1: 13, cat_2: 16, cat_3: 15, exam: 40, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 4, Subject: { sbj_code: 'SWD/PJ301', sbj_name: 'Analyse project requirements', sbj_credit: 8 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 43, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 4, Subject: { sbj_code: 'SWD/PJ301', sbj_name: 'Analyse project requirements', sbj_credit: 8 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 45, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 5, Subject: { sbj_code: 'SWD/UJ301', sbj_name: 'Design UI/UX', sbj_credit: 12 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 44, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 5, Subject: { sbj_code: 'SWD/UJ301', sbj_name: 'Design UI/UX', sbj_credit: 12 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 46, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 5, Subject: { sbj_code: 'SWD/UJ301', sbj_name: 'Design UI/UX', sbj_credit: 12 }, 
        cat_1: 17, cat_2: 20, cat_3: 19, exam: 49, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 6, Subject: { sbj_code: 'SWD/VJ301', sbj_name: 'Develop game in Vue', sbj_credit: 15 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 41, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 6, Subject: { sbj_code: 'SWD/VJ301', sbj_name: 'Develop game in Vue', sbj_credit: 15 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 44, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 6, Subject: { sbj_code: 'SWD/VJ301', sbj_name: 'Develop game in Vue', sbj_credit: 15 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 47, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 7, Subject: { sbj_code: 'CLN4301', sbj_name: 'Integrate at workplace', sbj_credit: 30 }, 
        cat_1: 17, cat_2: 20, cat_3: 19, exam: 50, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 7, Subject: { sbj_code: 'CLN4301', sbj_name: 'Integrate at workplace', sbj_credit: 30 }, 
        cat_1: 18, cat_2: 20, cat_3: 19, exam: 52, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 7, Subject: { sbj_code: 'CLN4301', sbj_name: 'Integrate at workplace', sbj_credit: 30 }, 
        cat_1: 19, cat_2: 20, cat_3: 20, exam: 54, semester: 'Term 3', ac_year: '2023/24' },

      // Core General
      { sbj_id: 8, Subject: { sbj_code: 'GEN/DJ301', sbj_name: 'Apply basic graphics design', sbj_credit: 10 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 43, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 8, Subject: { sbj_code: 'GEN/DJ301', sbj_name: 'Apply basic graphics design', sbj_credit: 10 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 45, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 8, Subject: { sbj_code: 'GEN/DJ301', sbj_name: 'Apply basic graphics design', sbj_credit: 10 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 47, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 9, Subject: { sbj_code: 'GEN/AJ301', sbj_name: 'Apply Algebra and Trigonometry', sbj_credit: 6 }, 
        cat_1: 13, cat_2: 16, cat_3: 15, exam: 38, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 9, Subject: { sbj_code: 'GEN/AJ301', sbj_name: 'Apply Algebra and Trigonometry', sbj_credit: 6 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 41, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 9, Subject: { sbj_code: 'GEN/AJ301', sbj_name: 'Apply Algebra and Trigonometry', sbj_credit: 6 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 43, semester: 'Term 3', ac_year: '2023/24' },

      { sbj_id: 10, Subject: { sbj_code: 'GEN/PJ301', sbj_name: 'Apply general physics', sbj_credit: 5 }, 
        cat_1: 12, cat_2: 15, cat_3: 14, exam: 37, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 10, Subject: { sbj_code: 'GEN/PJ301', sbj_name: 'Apply general physics', sbj_credit: 5 }, 
        cat_1: 13, cat_2: 16, cat_3: 15, exam: 40, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 10, Subject: { sbj_code: 'GEN/PJ301', sbj_name: 'Apply general physics', sbj_credit: 5 }, 
        cat_1: 14, cat_2: 17, cat_3: 16, exam: 42, semester: 'Term 3', ac_year: '2023/24' },

      // Complementary
      { sbj_id: 11, Subject: { sbj_code: 'CCM/CJ302', sbj_name: 'Describe occupation and learning strategies', sbj_credit: 3 }, 
        cat_1: 15, cat_2: 18, cat_3: 17, exam: 46, semester: 'Term 1', ac_year: '2023/24' },
      { sbj_id: 11, Subject: { sbj_code: 'CCM/CJ302', sbj_name: 'Describe occupation and learning strategies', sbj_credit: 3 }, 
        cat_1: 16, cat_2: 19, cat_3: 18, exam: 48, semester: 'Term 2', ac_year: '2023/24' },
      { sbj_id: 11, Subject: { sbj_code: 'CCM/CJ302', sbj_name: 'Describe occupation and learning strategies', sbj_credit: 3 }, 
        cat_1: 17, cat_2: 20, cat_3: 19, exam: 50, semester: 'Term 3', ac_year: '2023/24' },
    ]
  };

  // Process marks data by subject and term
  const processMarksData = (marks) => {
    const subjectMap = new Map();
    
    marks.forEach(mark => {
      const key = mark.Subject.sbj_code;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          code: mark.Subject.sbj_code,
          title: mark.Subject.sbj_name,
          credits: mark.Subject.sbj_credit,
          terms: {}
        });
      }
      
      const subject = subjectMap.get(key);
      const termKey = mark.semester.replace('Term ', '');
      
      // Calculate FA (average of cats), LA (exam), CA (total)
      const fa = ((parseFloat(mark.cat_1) + parseFloat(mark.cat_2) + parseFloat(mark.cat_3)) / 3).toFixed(2);
      const la = parseFloat(mark.exam).toFixed(2);
      const ca = (parseFloat(mark.cat_1) + parseFloat(mark.cat_2) + parseFloat(mark.cat_3) + parseFloat(mark.exam)).toFixed(2);
      const avg = ca; // AVG same as CA for this format
      
      subject.terms[termKey] = { fa, la, ca, avg };
    });

    return Array.from(subjectMap.values());
  };

  const loadStudentReport = () => {
    setLoading(true);
    // Simulate API call - replace with actual fetch
    setTimeout(() => {
      const processedMarks = processMarksData(mockData.marks);
      setReportData({
        student: mockData.student,
        subjects: processedMarks
      });
      setLoading(false);
    }, 500);
  };

  const calculateAnnualAverage = (terms) => {
    const values = Object.values(terms).map(t => parseFloat(t.avg));
    if (values.length === 0) return '0.00';
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  };

  const categorizeSubjects = (subjects) => {
    const coreSpecific = subjects.filter(s => s.code.startsWith('SWD/') || s.code === 'CLN4301');
    const coreGeneral = subjects.filter(s => s.code.startsWith('GEN/'));
    const complementary = subjects.filter(s => s.code.startsWith('CCM/'));
    return { coreSpecific, coreGeneral, complementary };
  };

  if (!reportData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Load Student Assessment Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2023/24"
              />
            </div>
            <button
              onClick={loadStudentReport}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Load Report (Demo Mode)'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Note: Currently using mock data. Replace API endpoint in production.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { coreSpecific, coreGeneral, complementary } = categorizeSubjects(reportData.subjects);
  const student = reportData.student;

  return (
    <div className="bg-white p-2">
      <div className="border border-black">
        {/* Header Section */}
        <div className="grid grid-cols-3 border-b border-black">
          <div className="border-r border-black p-3 text-xs">
            <div className="font-bold">INTANGO TECHNICAL SECONDARY SCHOOL</div>
            <div className="mt-1"><span className="font-bold">Phone:</span> 0788333010</div>
            <div><span className="font-bold">E-mail:</span> intangotss@gmail.com</div>
            <div><span className="font-bold">Website:</span> www.intangotss.rw</div>
          </div>
          
          <div className="border-r border-black p-3 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="text-white text-2xl font-bold">🔧</div>
            </div>
            <div className="text-[8px] font-bold mt-1 text-center">Intango Technical Secondary School</div>
            <div className="text-[7px] text-center">Skills Development School</div>
          </div>
          
          <div className="p-3 text-xs">
            <div><span className="font-bold">YEAR:</span> {academicYear}</div>
            <div className="mt-1"><span className="font-bold">CLASS:</span> {student.Class.class_name}</div>
            <div className="mt-1"><span className="font-bold">NAMES:</span> {student.std_fname} {student.std_mname} {student.std_lname}</div>
            <div className="mt-1"><span className="font-bold">REG NO:</span> {student.admission_number}</div>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gray-200 border-b border-black p-1.5 text-center">
          <h2 className="font-bold text-sm">TRAINEE'S ASSESSMENT REPORT</h2>
        </div>

        {/* Qualification Info */}
        <div className="border-b border-black">
          <div className="grid grid-cols-4 text-[10px]">
            <div className="border-r border-black p-1.5 font-bold">Qualification code</div>
            <div className="border-r border-black p-1.5 col-span-2"><span className="font-bold">Qualification Title</span> TVET CERTIFICATE III IN SOFTWARE DEVELOPMENT</div>
            <div className="p-1.5"></div>
          </div>
        </div>
        
        <div className="border-b border-black">
          <div className="grid grid-cols-4 text-[10px]">
            <div className="border-r border-black p-1.5"><span className="font-bold">Trade</span> SOFTWARE DEVELOPMENT</div>
            <div className="border-r border-black p-1.5 col-span-2"><span className="font-bold">RQF Level</span> LEVEL 3</div>
            <div className="p-1.5"></div>
          </div>
        </div>

        {/* Assessment Legend */}
        <div className="border-b border-black p-1.5 text-[9px]">
          <span className="font-bold">F.A:</span> Formative Assessment | <span className="font-bold">LA:</span> Integrated Assessment | <span className="font-bold">C.A:</span> Comprehensive Assessment | <span className="font-bold">AVG:</span> Average | <span className="font-bold">A.A:</span> Annual Average
        </div>

        {/* Main Assessment Table */}
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr>
              <th colSpan="3" rowSpan="2" className="border border-black p-1 bg-gray-100">Module Code</th>
              <th rowSpan="2" className="border border-black p-1 bg-gray-100">Competence Title</th>
              <th rowSpan="2" className="border border-black p-1 bg-gray-100">Credits</th>
              <th colSpan="4" className="border border-black p-0.5 bg-gray-100">1st Term</th>
              <th colSpan="4" className="border border-black p-0.5 bg-gray-100">2nd Term</th>
              <th colSpan="4" className="border border-black p-0.5 bg-gray-100">3rd Term</th>
              <th rowSpan="2" className="border border-black p-1 bg-gray-100">A.A<br/>(%)</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-black p-0.5">F.A</th>
              <th className="border border-black p-0.5">LA</th>
              <th className="border border-black p-0.5">C.A</th>
              <th className="border border-black p-0.5">AVG</th>
              <th className="border border-black p-0.5">F.A</th>
              <th className="border border-black p-0.5">LA</th>
              <th className="border border-black p-0.5">C.A</th>
              <th className="border border-black p-0.5">AVG</th>
              <th className="border border-black p-0.5">F.A</th>
              <th className="border border-black p-0.5">LA</th>
              <th className="border border-black p-0.5">C.A</th>
              <th className="border border-black p-0.5">AVG</th>
            </tr>
          </thead>
          <tbody>
            {/* Core Competencies - Specific */}
            <tr className="bg-blue-50">
              <td colSpan="18" className="border border-black p-1 font-bold">Core competencies - Specific</td>
            </tr>
            {coreSpecific.map((item, idx) => (
              <tr key={`cs-${idx}`}>
                <td colSpan="3" className="border border-black p-1">{item.code}</td>
                <td className="border border-black p-1">{item.title}</td>
                <td className="border border-black p-1 text-center">{item.credits}</td>
                {['1', '2', '3'].map(term => {
                  const termData = item.terms[term] || {};
                  return (
                    <React.Fragment key={term}>
                      <td className="border border-black p-1 text-center">{termData.fa || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.la || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.ca || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.avg || ''}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-black p-1 text-center font-bold">{calculateAnnualAverage(item.terms)}</td>
              </tr>
            ))}

            {/* Core Competencies - General */}
            <tr className="bg-green-50">
              <td colSpan="18" className="border border-black p-1 font-bold">Core competencies - General</td>
            </tr>
            {coreGeneral.map((item, idx) => (
              <tr key={`cg-${idx}`}>
                <td colSpan="3" className="border border-black p-1">{item.code}</td>
                <td className="border border-black p-1">{item.title}</td>
                <td className="border border-black p-1 text-center">{item.credits}</td>
                {['1', '2', '3'].map(term => {
                  const termData = item.terms[term] || {};
                  return (
                    <React.Fragment key={term}>
                      <td className="border border-black p-1 text-center">{termData.fa || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.la || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.ca || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.avg || ''}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-black p-1 text-center font-bold">{calculateAnnualAverage(item.terms)}</td>
              </tr>
            ))}

            {/* Complementary Competencies */}
            <tr className="bg-yellow-50">
              <td colSpan="18" className="border border-black p-1 font-bold">Complementary competencies</td>
            </tr>
            {complementary.map((item, idx) => (
              <tr key={`cc-${idx}`}>
                <td colSpan="3" className="border border-black p-1">{item.code}</td>
                <td className="border border-black p-1">{item.title}</td>
                <td className="border border-black p-1 text-center">{item.credits}</td>
                {['1', '2', '3'].map(term => {
                  const termData = item.terms[term] || {};
                  return (
                    <React.Fragment key={term}>
                      <td className="border border-black p-1 text-center">{termData.fa || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.la || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.ca || ''}</td>
                      <td className="border border-black p-1 text-center">{termData.avg || ''}</td>
                    </React.Fragment>
                  );
                })}
                <td className="border border-black p-1 text-center font-bold">{calculateAnnualAverage(item.terms)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Comments Section */}
        <div className="border-t border-black p-2">
          <div className="font-bold text-xs mb-1">Class Trainer's Comments & Signature</div>
          <div className="border border-gray-400 h-16"></div>
        </div>

        <div className="border-t border-black p-2">
          <div className="font-bold text-xs mb-1">Parents signature</div>
          <div className="border border-gray-400 h-12"></div>
        </div>

        {/* Deliberation Table */}
        <div className="border-t border-black">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 font-bold">Deliberation</th>
                <th className="border border-black p-2 font-bold">Promotion at 1st Sitting</th>
                <th className="border border-black p-2 font-bold">2nd Sitting</th>
                <th className="border border-black p-2 font-bold">Promoted after re-assessment</th>
                <th className="border border-black p-2 font-bold">Advised to Repeat</th>
                <th className="border border-black p-2 font-bold">Dismissed</th>
                <th className="border border-black p-2 font-bold">School Manager<br/>MURANGWA Annable<br/>SIGNATURE<br/>9th____/2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-3"></td>
                <td className="border border-black p-3 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-black p-3 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-black p-3 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-black p-3 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-black p-3 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-black p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
    {/* Footer */}
        <div className="bg-gray-100 p-1 text-right text-[8px] border-t border-black">
          Powered by intango TSS
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setReportData(null)}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Load Another Report
        </button>
      </div>
    </div>
  );
};

export default TraineeAssessmentReport;