import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Sparkles, FileText, Download } from 'lucide-react';
import axios from 'axios';

export const ResultsPanel = ({ data, extractedText, onReset }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  
  const score = data.matchScore || 0;
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-500 bg-green-50';
    if (s >= 60) return 'text-yellow-500 bg-yellow-50';
    return 'text-red-500 bg-red-50';
  };

  const getProgressBarColor = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/optimize', {
        resumeText: extractedText,
        missingSkills: data.missingSkills,
      });
      setOptimizedResume(response.data.optimizedResume);
    } catch (err) {
      alert('Error optimizing resume');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await axios.post('http://localhost:5000/api/interview-questions', {
        missingSkills: data.missingSkills,
        weakAreas: data.weakAreas
      });
      setInterviewQuestions(response.data.questions);
    } catch (err) {
      alert('Error generating questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={onReset}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </button>

      {/* Top Section - Match Score */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Resume Analysis Complete</h2>
          <p className="text-slate-600">Based on the job description, here is how well your resume matches the role requirements.</p>
        </div>
        
        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl w-48 ${getScoreColor(score)}`}>
          <div className="text-5xl font-extrabold mb-2">{score}%</div>
          <div className="text-sm font-semibold uppercase tracking-wider">Match Score</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Matching Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-lg text-slate-800">Matching Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.matchingSkills?.length > 0 ? data.matchingSkills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                {skill}
              </span>
            )) : <span className="text-sm text-slate-500">No strong matches found.</span>}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-lg text-slate-800">Missing Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.missingSkills?.length > 0 ? data.missingSkills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                {skill}
              </span>
            )) : <span className="text-sm text-slate-500">No missing skills!</span>}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-lg text-slate-800">Weak Areas</h3>
          </div>
          <ul className="space-y-2">
            {data.weakAreas?.length > 0 ? data.weakAreas.map((area, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                <span>{area}</span>
              </li>
            )) : <span className="text-sm text-slate-500">No notable weak areas.</span>}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="font-semibold text-lg text-slate-800 mb-4">Key Recommendations</h3>
          <ul className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ATS Resume Generation */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-md text-white">
          <h3 className="text-xl font-bold mb-2">Optimize Resume for ATS</h3>
          <p className="text-blue-100 text-sm mb-6 opacity-90">
            Let AI rewrite your bullet points using action verbs and naturally integrate missing keywords to pass ATS screeners.
          </p>
          
          {optimizedResume ? (
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Generated Resume (Preview)</span>
                <button className="text-xs flex items-center gap-1 hover:text-blue-200 transition">
                  <Download className="w-3 h-3" /> Download TXT
                </button>
              </div>
              <div className="text-xs text-blue-50 h-32 overflow-y-auto whitespace-pre-wrap font-mono custom-scrollbar">
                {optimizedResume}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleOptimizeResume}
              disabled={isOptimizing}
              className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isOptimizing ? 'AI is working...' : <><FileText className="w-5 h-5" /> Generate ATS Resume</>}
            </button>
          )}
        </div>

        {/* Interview Questions */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 shadow-md text-white">
          <h3 className="text-xl font-bold mb-2">AI Interview Prep</h3>
          <p className="text-emerald-100 text-sm mb-6 opacity-90">
            Generate custom technical and behavioral interview questions focused specifically on your weak areas and missing skills.
          </p>
          
          {interviewQuestions ? (
            <div className="bg-white/10 rounded-xl p-4 border border-white/20 h-44 overflow-y-auto custom-scrollbar">
               {interviewQuestions.map((q, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">{q.type} • {q.difficulty}</div>
                    <div className="text-sm text-white">{q.question}</div>
                  </div>
               ))}
            </div>
          ) : (
            <button 
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="w-full bg-white text-emerald-600 font-semibold py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isGeneratingQuestions ? 'Generating...' : <><Sparkles className="w-5 h-5" /> Generate Questions</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
