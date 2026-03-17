
import './App.css';

// Grade points matching typical Indian grading system
const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'U': 0,
};

// Available grades for the select dropdown
const GRADES = Object.keys(GRADE_POINTS);

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function App() {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: generateId(),
      name: 'Semester 1',
      subjects: [
        { id: generateId(), name: 'Mathematics', credits: 4, grade: 'A+' },
        { id: generateId(), name: 'Physics', credits: 3, grade: 'A' },
        { id: generateId(), name: 'Computer Science', credits: 4, grade: 'O' }
      ]
    }
  ]);

  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: generateId(),
        name: `Semester ${semesters.length + 1}`,
        subjects: [{ id: generateId(), name: '', credits: 3, grade: 'A' }]
      }
    ]);
  };

  const removeSemester = (semId: string) => {
    setSemesters(semesters.filter(s => s.id !== semId));
  };

  const addSubject = (semId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return {
          ...s,
          subjects: [...s.subjects, { id: generateId(), name: '', credits: 3, grade: 'A' }]
        };
      }
      return s;
    }));
  };

  const removeSubject = (semId: string, subId: string) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return { ...s, subjects: s.subjects.filter(sub => sub.id !== subId) };
      }
      return s;
    }));
  };

  const updateSubject = (semId: string, subId: string, field: keyof Subject, value: string | number) => {
    setSemesters(semesters.map(s => {
      if (s.id === semId) {
        return {
          ...s,
          subjects: s.subjects.map(sub => sub.id === subId ? { ...sub, [field]: value } : sub)
        };
      }
      return s;
    }));
  };

  // Calculate statistics using useMemo
  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    
    const semStats = semesters.map(sem => {
      let semCredits = 0;
      let semPoints = 0;
      sem.subjects.forEach(sub => {
        semCredits += sub.credits;
        semPoints += sub.credits * (GRADE_POINTS[sub.grade] || 0);
      });
      totalCredits += semCredits;
      totalPoints += semPoints;
      
      const gpa = semCredits === 0 ? 0 : semPoints / semCredits;
      return { id: sem.id, gpa, credits: semCredits };
    });

    const cgpa = totalCredits === 0 ? 0 : totalPoints / totalCredits;
    return { cgpa, totalCredits, semStats };
  }, [semesters]);

  const getSemStat = (semId: string) => {
    return stats.semStats.find(s => s.id === semId);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>CGPA Calculator</h1>
        <p>Estimate your academic performance effortlessly</p>
      </header>

      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-label">Cumulative GPA</div>
          <div className="stat-value">{stats.cgpa.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Credits</div>
          <div className="stat-value">{stats.totalCredits}</div>
        </div>
      </div>

      <div className="semesters-container">
        {semesters.map((sem, index) => {
          const semStat = getSemStat(sem.id);
          return (
            <div 
              key={sem.id} 
              className="semester-card" 
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="semester-header">
                <div className="semester-title">
                  <h2>{sem.name}</h2>
                  <span className="semester-gpa">
                    GPA: {semStat?.gpa.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div className="subjects-grid">
                {sem.subjects.map(sub => (
                  <div key={sub.id} className="subject-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Subject Name (optional)"
                      value={sub.name}
                      onChange={(e) => updateSubject(sem.id, sub.id, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      className="input-field"
                      min="1"
                      max="10"
                      placeholder="Credits"
                      value={sub.credits || ''}
                      onChange={(e) => updateSubject(sem.id, sub.id, 'credits', parseInt(e.target.value) || 0)}
                    />
                    <select
                      className="input-field"
                      value={sub.grade}
                      onChange={(e) => updateSubject(sem.id, sub.id, 'grade', e.target.value)}
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeSubject(sem.id, sub.id)}
                      title="Remove Subject"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="semester-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => addSubject(sem.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Subject
                </button>
                <button 
                  className="btn btn-secondary"
                  style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={() => removeSemester(sem.id)}
                >
                  Remove Semester
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="add-semester-container">
        <button className="btn btn-primary" onClick={addSemester}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Semester
        </button>
      </div>
    </div>
  );
}

export default App;
