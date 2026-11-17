# Product — Ildiz

**What:** a web app (phone first) that diagnoses a 5–6 grade student's
knowledge of fractions in ~10 questions, finds the *root* gap in the
prerequisite graph, builds a personal learning path from that root up,
and tutors in Uzbek with an AI that explains the specific wrong thinking.
Teachers see the whole class live and print a worksheet for each
root-gap group.

**Who:**
- Student, 11–12 years old, Uzbek-speaking, on a mid-range Android phone,
  often on mobile data. Wants to feel smart, not tested.
- Teacher of a 30-pupil class, on a laptop or projector. Wants to know
  which pupils share the same underlying gap, in seconds.
- Hackathon judges: see it on a projector, try it on their own phone.

**Why:** a wrong answer in "adding fractions" is usually a symptom; the
cause often sits two levels lower (finding the LCM). Teachers see the
symptom, not the cause. Ildiz shows the cause.

**Surfaces and modes:**
- Landing `/` — persuade.
- Student flow `/start`, `/diagnostic`, `/result`, `/path`, `/learn/*` — experience (calm, encouraging, playful precision).
- Teacher `/teacher/*` — operate (scannable, dense, projector-legible).

**Voice:** Uzbek Latin. Student: warm, short, "sen", encouraging, never
shaming ("Keling, birga ko'ramiz"). Teacher: clear, respectful, "Siz".

**Must never:** show wrong math, shame a student, look like a generic
template, depend on hackathon wi-fi.
