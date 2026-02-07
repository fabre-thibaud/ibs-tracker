I need you to create a mobile-friendly web application for tracking digestive health symptoms related to IBS (Irritable Bowel Syndrome) and potential chronic pancreatitis. This is for personal medical tracking to share with doctors.

CORE FEATURES REQUIRED:

1. MEAL TRACKING:
   - Time of meal (auto-populate with current time, but editable)
   - Meal type (Breakfast/Lunch/Dinner/Snack - dropdown)
   - Food content (text area for description)
   - Portion size (Small/Medium/Large - buttons or dropdown)
   - Option to mark high-fat meals (checkbox)

2. PAIN EPISODE TRACKING:
   - Time of pain onset (auto-populate with current time, but editable)
   - Location (Right Upper Abdomen/Left Upper Abdomen/Central/Lower/Other - dropdown or buttons)
   - Severity scale 1-10 (slider or number buttons)
   - Duration in minutes (number input)
   - Character (Cramping/Sharp/Dull/Burning/Other - dropdown)
   - What preceded it (text field - optional)
   - What helped (text field - optional)

3. BOWEL MOVEMENT TRACKING:
   - Time (auto-populate with current time, but editable)
   - Bristol Stool Scale Type 1-7 (visual buttons with icons/descriptions)
     * Type 1: Separate hard lumps (severe constipation)
     * Type 2: Lumpy and sausage-like (mild constipation)
     * Type 3: Sausage with cracks (normal)
     * Type 4: Smooth, soft sausage (ideal/normal)
     * Type 5: Soft blobs (lacking fiber)
     * Type 6: Mushy, fluffy pieces (mild diarrhea)
     * Type 7: Entirely liquid (severe diarrhea)
   - Color (Normal Brown/Dark/Pale/Red/Black/Other - dropdown with color indicators)
   - Any blood or mucus (Yes/No checkboxes)
   - Urgency (Yes/No)
   - Complete evacuation feeling (Yes/No)

4. DAILY SUMMARY:
   - Overall feeling (1-10 scale)
   - Energy level (1-10 scale)
   - Sleep quality (1-10 scale - optional)
   - Stress level (1-10 scale - optional)
   - Free text notes

5. DATE NAVIGATION:
   - Calendar view to jump to specific dates
   - Previous/Next day buttons
   - "Today" quick button
   - View/edit entries for any past date

6. WEEKLY SUMMARY VIEW:
   - Show all entries for selected week
   - Count of pain episodes
   - Average pain severity
   - Pattern visualization (which Bristol types were most common)
   - List of all foods eaten (to identify patterns)
   - Summary statistics

7. DATA EXPORT:
   - Export weekly summary as text or PDF
   - Export all data as CSV
   - "Share with doctor" formatted summary

TECHNICAL REQUIREMENTS:
- Mobile-first responsive design (will be used primarily on phone)
- Works offline (Progressive Web App with local storage)
- Clean, simple, fast interface
- No login required (single-user, local storage only)
- No backend needed - everything client-side
- Large, touch-friendly buttons
- Quick entry mode (minimal clicks to log something)
- Data persists in browser localStorage
- Option to clear all data

UI/UX PRIORITIES:
- FAST entry - should take <30 seconds to log a meal or symptom
- Clear visual hierarchy
- Today's entries prominently displayed
- Easy to see history at a glance
- Bristol Scale with visual reference chart
- Color-coded severity (pain levels, Bristol types)
- Minimal text input where possible (use buttons/dropdowns)

NICE TO HAVE (if simple to implement):
- Pattern detection hints ("You've had pain after high-fat meals 3 times this week")
- Reminder notifications (optional)
- Dark mode toggle
- Time between meal and pain calculation
- Search/filter functionality

DESIGN AESTHETIC:
- Clean, medical/health-focused design
- Professional but friendly
- Use green for positive/normal, yellow for caution, red for concerning
- Clear iconography
- Accessible (good contrast, readable fonts)

Please create this as a single-page application using HTML, CSS, and vanilla JavaScript (or React if simpler). Focus on functionality over fancy features - this is a medical tool that needs to be reliable and easy to use daily.

Include clear instructions for how to use the app and how to export data. Expected export format is in file EXPORT_FORMAT.md.
