const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

const defaultData = {
  users: [
    { id: 'admin-1', role: 'admin', username: 'admin', email: 'admin@school.edu', password: 'admin123', name: 'School Administrator' },
    { id: 'teacher-1', role: 'teacher', username: 'teacher1', email: 'teacher1@school.edu', password: 'teacher123', name: 'Mr. Johnson' },
    { id: 'teacher-2', role: 'teacher', username: 'teacher2', email: 'teacher2@school.edu', password: 'teacher123', name: 'Mrs. Adeyemi' },
    { id: 'teacher-test', role: 'teacher', username: 'teacher.test', email: 'teacher.test@school.edu', password: 'teacher123', name: 'Adebayo' },
    { id: 'student-1', role: 'student', username: 'student1', password: 'student123', name: 'Alice Okafor', className: 'SS2A', studentId: 'ST-001' },
    { id: 'student-2', role: 'student', username: 'student2', password: 'student123', name: 'Daniel Smith', className: 'SS2A', studentId: 'ST-002' },
    { id: 'student-3', role: 'student', username: 'student3', password: 'student123', name: 'Grace Mensah', className: 'SS2B', studentId: 'ST-003' },
    { id: 'student-4', role: 'student', username: 'student4', password: 'student123', name: 'Samuel Adebayo', className: 'SS3A', studentId: 'ST-004' },
    { id: 'student-5', role: 'student', username: 'student5', password: 'student123', name: 'Chinelo Umeh', className: 'SS3A', studentId: 'ST-005' }
  ],
  schools: [],
  questions: [
    {
      id: 'q-101',
      teacherId: 'teacher-1',
      teacherName: 'Mr. Johnson',
      subject: 'Mathematics',
      question: 'What is the value of 7 + 9?',
      options: ['12', '14', '16', '18'],
      correctIndex: 2,
      status: 'approved',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'q-102',
      teacherId: 'teacher-1',
      teacherName: 'Mr. Johnson',
      subject: 'English',
      question: 'Choose the correct pronoun: "The teacher called ___ to the board."',
      options: ['he', 'him', 'his', 'hers'],
      correctIndex: 1,
      status: 'approved',
      createdAt: '2026-09-01T09:00:00.000Z'
    },
    {
      id: 'q-103',
      teacherId: 'teacher-2',
      teacherName: 'Mrs. Adeyemi',
      subject: 'Biology',
      question: 'Which part of the plant conducts photosynthesis?',
      options: ['Root', 'Leaf', 'Stem', 'Flower'],
      correctIndex: 1,
      status: 'approved',
      createdAt: '2026-09-05T10:00:00.000Z'
    },
    {
      id: 'q-104',
      teacherId: 'teacher-2',
      teacherName: 'Mrs. Adeyemi',
      subject: 'Chemistry',
      question: 'Which gas is released during photosynthesis?',
      options: ['Nitrogen', 'Oxygen', 'Carbon dioxide', 'Hydrogen'],
      correctIndex: 1,
      status: 'pending',
      createdAt: '2026-09-06T11:00:00.000Z'
    }
  ],
  results: [
    { id: 'result-1', studentId: 'ST-001', studentName: 'Alice Okafor', className: 'SS2A', score: 8, total: 10, submittedAt: '2026-09-12T09:00:00.000Z' },
    { id: 'result-2', studentId: 'ST-002', studentName: 'Daniel Smith', className: 'SS2A', score: 7, total: 10, submittedAt: '2026-09-12T11:20:00.000Z' },
    { id: 'result-3', studentId: 'ST-003', studentName: 'Grace Mensah', className: 'SS2B', score: 9, total: 10, submittedAt: '2026-09-13T08:15:00.000Z' },
    { id: 'result-4', studentId: 'ST-004', studentName: 'Samuel Adebayo', className: 'SS3A', score: 6, total: 10, submittedAt: '2026-09-14T10:30:00.000Z' }
  ]
};

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return;
  }

  const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  currentData.schools = Array.isArray(currentData.schools) ? currentData.schools : [];

  const hasTestTeacher = currentData.users?.some((user) => normalizeIdentifier(user.email || user.username) === 'teacher.test@school.edu');

  if (!hasTestTeacher) {
    currentData.users.push({
      id: 'teacher-test',
      role: 'teacher',
      username: 'teacher.test',
      email: 'teacher.test@school.edu',
      password: 'teacher123',
      name: 'Adebayo'
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
  }

  currentData.users = currentData.users.map((user) => {
    if (user.role === 'teacher' && !user.email && user.username) {
      return {
        ...user,
        email: user.username
      };
    }
    return user;
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
}

function readData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'School CBT API is running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, email, password, role } = req.body || {};
  const data = readData();
  const loginIdentifier = normalizeIdentifier(email || username);

  const user = data.users.find((entry) => {
    const matchesRole = !role || entry.role === role;
    const entryIdentifier = normalizeIdentifier(entry.email || entry.username);
    const matchesIdentifier = entryIdentifier === loginIdentifier;
    return matchesIdentifier && String(entry.password || '') === String(password || '') && matchesRole;
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email/username, password, or role.' });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email || null,
    role: user.role,
    className: user.className || null,
    studentId: user.studentId || null
  };

  res.json({ user: safeUser });
});

app.post('/api/schools/register', (req, res) => {
  const {
    schoolName,
    schoolType,
    contactPerson,
    schoolEmail,
    schoolPhone,
    schoolAddress
  } = req.body || {};

  if (!schoolName || !schoolType || !contactPerson || !schoolEmail || !schoolPhone || !schoolAddress) {
    return res.status(400).json({ message: 'All school registration fields are required.' });
  }

  const data = readData();
  const school = {
    id: `school-${Date.now()}`,
    name: String(schoolName).trim(),
    type: String(schoolType).trim(),
    contactPerson: String(contactPerson).trim(),
    email: String(schoolEmail).trim(),
    phone: String(schoolPhone).trim(),
    address: String(schoolAddress).trim(),
    createdAt: new Date().toISOString()
  };

  data.schools = Array.isArray(data.schools) ? data.schools : [];
  data.schools.push(school);
  writeData(data);

  res.status(201).json({
    success: true,
    message: 'School registered successfully.',
    school
  });
});

app.post('/api/auth/register-student', (req, res) => {
  const { name, username, password, className, studentId } = req.body || {};

  if (!name || !className || !studentId) {
    return res.status(400).json({ message: 'Student name, class, and ID are required.' });
  }

  const generatedUsername = username || `student.${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')}`;
  const generatedPassword = password || `student${String(studentId).replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase() || '1234'}`;

  const data = readData();
  const exists = data.users.some((user) => user.username === username || user.studentId === studentId);
  if (exists) {
    return res.status(409).json({ message: 'A student with that username or ID already exists.' });
  }

  const newStudent = {
    id: `student-${Date.now()}`,
    role: 'student',
    username: generatedUsername,
    password: generatedPassword,
    name,
    className,
    studentId
  };

  data.users.push(newStudent);
  writeData(data);

  res.status(201).json({
    message: 'Student login created successfully.',
    user: {
      id: newStudent.id,
      name: newStudent.name,
      username: newStudent.username,
      role: newStudent.role,
      className: newStudent.className,
      studentId: newStudent.studentId
    }
  });
});

app.post('/api/auth/register-teacher', (req, res) => {
  const { name, email, username, password } = req.body || {};
  const teacherEmail = normalizeIdentifier(email || username);

  if (!name || !teacherEmail || !password) {
    return res.status(400).json({ message: 'Teacher name, email, and password are required.' });
  }

  const data = readData();
  const exists = data.users.some((user) => normalizeIdentifier(user.email || user.username) === teacherEmail);
  if (exists) {
    return res.status(409).json({ message: 'A teacher with that email already exists.' });
  }

  const teacher = {
    id: `teacher-${Date.now()}`,
    role: 'teacher',
    username: teacherEmail,
    email: teacherEmail,
    password,
    name
  };

  data.users.push(teacher);
  writeData(data);

  res.status(201).json({
    message: 'Teacher account created successfully.',
    user: {
      id: teacher.id,
      name: teacher.name,
      username: teacher.username,
      email: teacher.email,
      role: teacher.role
    }
  });
});

app.get('/api/schools', (req, res) => {
  const data = readData();
  const schools = Array.isArray(data.schools) ? data.schools : [];

  res.json({
    success: true,
    schools: schools.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  });
});

app.get('/api/dashboard/admin', (req, res) => {
  const data = readData();
  const students = data.users.filter((user) => user.role === 'student');
  const teachers = data.users.filter((user) => user.role === 'teacher');
  const pendingQuestions = data.questions.filter((question) => question.status === 'pending');
  const approvedQuestions = data.questions.filter((question) => question.status === 'approved');
  const schools = Array.isArray(data.schools) ? data.schools : [];

  const studentSummaries = students.map((student, index) => {
    const studentResults = data.results.filter((result) => result.studentId === student.studentId);
    const totalScores = studentResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = studentResults.length ? Math.round((totalScores / studentResults.length) / (studentResults[0]?.total || 1) * 100) : 0;
    const latestScore = studentResults.length ? studentResults[studentResults.length - 1].score : 0;

    return {
      ...student,
      attendance: 82 + ((index + 1) * 3) % 12,
      averageScore,
      latestScore,
      resultCount: studentResults.length,
      grade: averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B' : averageScore >= 60 ? 'C' : averageScore >= 50 ? 'D' : 'F'
    };
  });

  res.json({
    stats: {
      students: students.length,
      teachers: teachers.length,
      pendingQuestions: pendingQuestions.length,
      approvedQuestions: approvedQuestions.length,
      schools: schools.length
    },
    students: studentSummaries,
    pendingQuestions,
    recentResults: data.results.slice(0, 5).reverse(),
    questions: data.questions,
    schools: schools.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  });
});

app.get('/api/dashboard/teacher/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const data = readData();
  const teacherQuestions = data.questions.filter((question) => question.teacherId === teacherId);

  res.json({
    teacher: data.users.find((user) => user.id === teacherId),
    questions: teacherQuestions
  });
});

app.get('/api/dashboard/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const student = data.users.find((user) => user.role === 'student' && user.studentId === studentId);

  if (!student) {
    return res.status(404).json({ message: 'Student record not found.' });
  }

  const examResults = data.results.filter((result) => result.studentId === studentId);

  res.json({
    student,
    examResults,
    totalAttempts: examResults.length,
    bestScore: examResults.reduce((best, result) => Math.max(best, result.score), 0)
  });
});

app.get('/api/questions', (req, res) => {
  const data = readData();
  res.json({ questions: data.questions });
});

app.post('/api/questions', (req, res) => {
  const { teacherId, teacherName, subject, question, options, correctIndex } = req.body || {};

  if (!teacherId || !subject || !question || !Array.isArray(options) || options.length < 2 || correctIndex === undefined) {
    return res.status(400).json({ message: 'Incomplete question data.' });
  }

  const data = readData();
  const newQuestion = {
    id: `q-${Date.now()}`,
    teacherId,
    teacherName: teacherName || 'Teacher',
    subject,
    question,
    options,
    correctIndex: Number(correctIndex),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  data.questions.push(newQuestion);
  writeData(data);

  res.status(201).json({ message: 'Question submitted successfully and linked for admin review.', question: newQuestion });
});

app.post('/api/questions/:id/review', (req, res) => {
  const { id } = req.params;
  const { action } = req.body || {};
  const data = readData();

  const question = data.questions.find((item) => item.id === id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found.' });
  }

  question.status = action === 'reject' ? 'rejected' : 'approved';
  writeData(data);

  res.json({ message: `Question ${question.status}.`, question });
});

app.get('/api/exam/:studentId', (req, res) => {
  const { studentId } = req.params;
  const data = readData();
  const student = data.users.find((user) => user.role === 'student' && user.studentId === studentId);

  if (!student) {
    return res.status(404).json({ message: 'Student record not found.' });
  }

  const approvedQuestions = data.questions.filter((question) => question.status === 'approved');

  if (!approvedQuestions.length) {
    return res.status(404).json({ message: 'No approved questions available for this exam yet.' });
  }

  res.json({
    student,
    durationMinutes: 30,
    questions: approvedQuestions.map((question) => ({
      id: question.id,
      subject: question.subject,
      question: question.question,
      options: question.options
    }))
  });
});

app.post('/api/exam/:studentId/submit', (req, res) => {
  const { studentId } = req.params;
  const { answers = [] } = req.body || {};
  const data = readData();

  const student = data.users.find((user) => user.role === 'student' && user.studentId === studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student record not found.' });
  }

  const approvedQuestions = data.questions.filter((question) => question.status === 'approved');
  let score = 0;

  approvedQuestions.forEach((question) => {
    const selectedAnswer = answers.find((answer) => answer.questionId === question.id)?.selectedIndex;
    if (selectedAnswer === question.correctIndex) {
      score += 1;
    }
  });

  const result = {
    id: `result-${Date.now()}`,
    studentId,
    studentName: student.name,
    className: student.className,
    score,
    total: approvedQuestions.length,
    submittedAt: new Date().toISOString()
  };

  data.results.push(result);
  writeData(data);

  res.json({
    message: 'Exam submitted successfully.',
    result
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`School CBT app is running on http://localhost:${PORT}`);
  });
}

module.exports = { app };
