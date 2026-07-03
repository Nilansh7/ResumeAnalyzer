const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log('Groq API Key loaded:', GROQ_API_KEY ? '✅ Yes' : '❌ No');

// Roasting messages based on ATS score
const getRoast = (score) => {
  if (score < 40) {
    const brutals = [
      `${score}/100 - Your ATS just ghosted you harder than any recruiter will. This resume screams "I applied randomly."`,
      `${score}/100 - Even the ATS is confused. Did you copy-paste from ChatGPT or just give up halfway?`,
      `${score}/100 - This ATS score is lower than your hopes of getting this job. Time to rewrite, seriously.`,
      `${score}/100 - Your resume alignment is so bad, the bot thinks you're applying for a job in the wrong dimension.`,
      `${score}/100 - The ATS didn't just reject you—it reported you for not reading the job description.`,
    ];
    return brutals[Math.floor(Math.random() * brutals.length)];
  } else if (score < 60) {
    const harsh = [
      `${score}/100 - You're in "depends on luck" territory. Hope the recruiter had a good coffee.`,
      `${score}/100 - Not terrible, but also not convincing. You're the "maybe" pile—barely.`,
      `${score}/100 - The ATS passed you, but just barely. Don't celebrate yet. You need to do better.`,
      `${score}/100 - Meh. You have the skills, but your resume doesn't scream it. Step it up.`,
    ];
    return harsh[Math.floor(Math.random() * harsh.length)];
  } else if (score < 75) {
    const mixed = [
      `${score}/100 - Getting there! You're in the "worth a phone screen" club. Now don't mess up the interview.`,
      `${score}/100 - Not bad! You aligned well, but there's still room to impress. Add a bit more punch.`,
      `${score}/100 - Solid alignment. The ATS approves. Now let's hope you can actually code in an interview.`,
      `${score}/100 - Pretty good! You're in contention. Time to make the hiring manager regret not calling you sooner.`,
    ];
    return mixed[Math.floor(Math.random() * mixed.length)];
  } else {
    const motivational = [
      `${score}/100 - Chef's kiss! 🚀 Your resume is basically a VIP pass. Now don't mess this up.`,
      `${score}/100 - Damn! You nailed the alignment. The ATS is impressed. Go get that interview!`,
      `${score}/100 - Excellent alignment! You're exactly what they're looking for. Go close this deal.`,
      `${score}/100 - Outstanding! Your resume speaks their language. Time to convert this into an offer.`,
    ];
    return motivational[Math.floor(Math.random() * motivational.length)];
  }
};

// Extract ATS score
const extractAtsScore = (text) => {
  const scoreMatch = text.match(/ATS alignment score:\s*(\d+)/i);
  if (scoreMatch) {
    return parseInt(scoreMatch[1]);
  }
  return null;
};

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { jd, resume } = req.body;

  if (!jd || !resume) {
    return res.status(400).json({ error: 'JD and Resume required' });
  }

  try {
    console.log('Calling Groq API for initial analysis...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Analyze this resume against the job description.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

Provide:
1. ATS alignment score (0-100)
2. Key missing keywords
3. 3 suggestions for improvement

Format clearly with numbers and bullet points.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Groq API error', details: data });
    }

    const analysisText = data.choices[0].message.content;
    const atsScore = extractAtsScore(analysisText);
    const roast = getRoast(atsScore || 50);

    // Optimization suggestions
    console.log('Calling Groq API for resume optimization...');

    const optimizationResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `You are a resume optimization expert. Analyze the resume against the job description and provide targeted before/after suggestions ONLY for sections that genuinely need improvement.

JOB DESCRIPTION:
${jd}

RESUME:
${resume}

For EACH section of the resume (Profile Summary, Education, Work Experience, Projects, Technical Skills), decide:
1. Does this section need optimization for this JD? (YES/NO)
2. If YES, provide:
   - BEFORE: The current text (exact snippet)
   - AFTER: The optimized text (add relevant keywords, emphasize alignment)
3. If NO, write: "✅ Already optimized - No changes needed"

Format as:

**Profile Summary**
[Your decision and before/after or "✅ Already optimized"]

**Work Experience**
[Your decision and before/after or "✅ Already optimized"]

**Projects**
[Your decision and before/after or "✅ Already optimized"]

**Technical Skills**
[Your decision and before/after or "✅ Already optimized"]

Be specific and concise. Only suggest changes that directly align with the JD.`,
          },
        ],
      }),
    });

    const optimizationData = await optimizationResponse.json();

    if (!optimizationResponse.ok) {
      return res.status(500).json({ error: 'Optimization API error', details: optimizationData });
    }

    const optimizationText = optimizationData.choices[0].message.content;

    // Cover Letter Generation
    console.log('Calling Groq API for cover letter...');

    const coverLetterResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Write a professional, personalized cover letter based on this resume and job description. The cover letter should:

1. Be 2-3 paragraphs
2. Reference specific skills/projects from the resume that align with the JD
3. Show genuine interest in the role and company
4. Be concise, professional, and compelling
5. End with a call to action
6. Use "I" not "we" or generic phrases

RESUME:
${resume}

JOB DESCRIPTION:
${jd}

Write ONLY the cover letter body (no "Dear Hiring Manager" or signature). Make it ready to paste into an email or application.`,
          },
        ],
      }),
    });

    const coverLetterData = await coverLetterResponse.json();

    if (!coverLetterResponse.ok) {
      return res.status(500).json({ error: 'Cover letter API error', details: coverLetterData });
    }

    const coverLetterText = coverLetterData.choices[0].message.content;

    res.json({
      atsScore: atsScore || 50,
      roast: roast,
      analysis: analysisText,
      optimization: optimizationText,
      coverLetter: coverLetterText,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});