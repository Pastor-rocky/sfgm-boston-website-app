# Course Page Comprehensive Audit
## `/course/1` - Complete Functionality Analysis

---

## 📋 Table of Contents
1. [Page Structure Overview](#page-structure-overview)
2. [Component Architecture](#component-architecture)
3. [Card System](#card-system)
4. [Video Section](#video-section)
5. [Reading Section](#reading-section)
6. [Quiz Section](#quiz-section)
7. [Progress Tracking System](#progress-tracking-system)
8. [Button Functionality](#button-functionality)
9. [Completion States](#completion-states)
10. [Quiz Structure](#quiz-structure)
11. [Data Flow](#data-flow)
12. [API Endpoints](#api-endpoints)

---

## 1. Page Structure Overview

### Main Components
- **`CourseDetail`** (`client/src/pages/course-detail.tsx`)
  - Main page wrapper
  - Handles enrollment status
  - Renders course header, description, and cover image
  - Conditionally renders `CourseContentViewer` based on enrollment

- **`CourseContentViewer`** (`client/src/components/course-content-viewer.tsx`)
  - Core content display component (4,777 lines)
  - Manages all tabs (Videos, Readings, Quizzes)
  - Handles progress tracking
  - Implements week-based progression logic

### Layout Structure
```
CourseDetail
├── Navigation
├── Course Header (cover image, title, description)
├── Course Information Card
├── Enrollment Button/Badge
└── CourseContentViewer (if enrolled)
    ├── Progress Overview Card
    ├── Tabs (Videos/Readings/Quizzes)
    └── Content Sections
```

---

## 2. Component Architecture

### State Management
- **React Query** for data fetching and caching
- **Local State** for UI interactions (tabs, modals)
- **Progress State** synced with backend via mutations

### Key Hooks
```typescript
// Data Fetching
useQuery(['/api/courses/${courseId}/videos'])
useQuery(['/api/courses/${courseId}/readings'])
useQuery(['/api/student/quizzes/all'])
useQuery(['/api/content-progress/${courseId}'])
useQuery(['/api/quiz-attempts/course/${courseId}'])

// Mutations
useMutation('/api/content-progress') // Progress tracking
```

---

## 3. Card System

### Card Types

#### 1. **Progress Overview Card**
- **Location**: Top of CourseContentViewer
- **Structure**:
  - 3-column grid (or 2-column for courses without videos)
  - Shows completion stats: Videos/Readings/Quizzes
  - Progress bars for each category
- **Data Source**: `getCompletionStats()` function
- **Styling**: 
  - Blue for videos
  - Green for readings
  - Purple for quizzes

#### 2. **Video Cards**
- **Structure**:
  ```tsx
  <Card className="border-l-4 border-blue-500">
    <CardHeader>
      <CardTitle>Video Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>
      <Button>Watch Video</Button>
    </CardContent>
  </Card>
  ```
- **States**:
  - **Accessible**: Blue left border, full opacity
  - **Locked**: Gray border, 60% opacity
  - **Completed**: Green badge "Completed - Proceed to Reading Section"

#### 3. **Reading Cards**
- **Structure**: Similar to video cards but with different content types
- **Special Cases**:
  - Course 1 (Acts in Action): Hardcoded reading IDs per week
  - Course 2 (Fire Starter): Audiobook + Bible reading per week
  - Course 3 (Don't Be a Jonah): Hardcoded week-by-week structure
- **Button Types**:
  - Audiobook button (blue gradient)
  - Bible reading button (green outline)
  - PDF/External link buttons

#### 4. **Quiz Cards**
- **Structure**:
  ```tsx
  <Card className="border-l-4 border-purple-500">
    <CardContent>
      <h4>Quiz Title</h4>
      <p>Questions • Time • Passing Score</p>
      <Button>Take Quiz</Button>
    </CardContent>
  </Card>
  ```
- **Final Exam Styling**: Red border, gradient background (red-50 to orange-50)

---

## 4. Video Section

### Video Card Rendering Logic

#### Default Rendering (Most Courses)
1. **Sorting**: Videos sorted by `orderIndex`
2. **Week Extraction**: Extracts week number from title using `extractWeekNumber()`
3. **Accessibility Check**: `canAccessWeek(weekNumber)`
4. **Completion Check**: `isContentCompleted('video', video.id)`

#### Special Course Handling
- **Course 3 (Don't Be a Jonah)**: 
  - Only weeks 1, 3, 5, 7, 9 have videos
  - Shows "No Video This Week" for other weeks
- **Course 7 (Level Up Leadership)**: 
  - Purple theme instead of blue
  - No week-based locking (all accessible)

### Video Button Functionality

#### Watch Video Button
```typescript
onClick={() => {
  if (video.videoUrl) {
    setCurrentVideo(video);
    setVideoModalOpen(true);
    progressMutation.mutateAsync({
      courseId,
      contentType: 'video',
      contentId: video.id,
      completed: true
    });
  }
}}
```

**Flow**:
1. Opens video modal
2. Immediately marks video as completed
3. Invalidates progress query to refresh UI
4. Shows toast on error

#### Locked State Button
- Disabled button with lock icon
- Shows message: `getCompletionMessage(weekNumber, 'reading')`
- Examples: "Complete Week 1 First", "Watch Videos First"

### Video Modal
- **Component**: Dialog from `@/components/ui/dialog`
- **Content**: YouTube embed or video player
- **YouTube ID Extraction**: `getYouTubeVideoId(url)`

---

## 5. Reading Section

### Reading Card Structure

#### Course 1 (Acts in Action) - Hardcoded Structure
Each week has 3 readings:
1. **Introduction/Chapter** (Audiobook)
2. **Chapter** (Audiobook)
3. **Bible Chapters** (External link)

**Reading IDs Mapping**:
```typescript
Week 1: [1, 2, 3]   // Introduction, Chapter 1, Bible 1-2
Week 2: [4, 5]      // Chapter 2, Bible 3-5
Week 3: [6, 7]      // Chapter 3, Bible 6-8
// ... continues through Week 10
```

#### Course 2 (Fire Starter) - Database + Hardcoded
- **Audiobook**: From database (chapterNumber = weekNumber)
- **Bible Reading**: Hardcoded in UI (no DB ID)
- **Progress Tracking**: Uses placeholder IDs (2000 + weekNumber) for Bible readings

#### Course 3 (Don't Be a Jonah) - Fully Hardcoded
- 11 weeks of readings
- Each week: Audiobook chapter + Bible chapter
- Navigation to dedicated chapter pages

### Reading Button Functionality

#### Audiobook Button
```typescript
onClick={createReadingProgressHandler(contentId, () => {
  setLocation('/route-to-audiobook');
})}
```

**`createReadingProgressHandler` Function**:
```typescript
const createReadingProgressHandler = (contentId: number, action: () => void) => {
  return async () => {
    await progressMutation.mutateAsync({
      courseId,
      contentType: 'reading',
      contentId,
      completed: true
    });
    queryClient.invalidateQueries({ queryKey: [`/api/content-progress/${courseId}`] });
    action(); // Navigate or open link
  };
};
```

#### Bible Reading Button
- Opens external link (Bible Gateway)
- Tracks progress using `createReadingProgressHandler`
- Shows completion state: "✅ Complete - Proceed to Quiz"

### Reading Completion States
- **Locked**: Gray button, disabled
- **Available**: Blue gradient (audiobook) or green outline (Bible)
- **Completed**: Green button with checkmark
- **All Week Readings Complete**: Shows "✅ Complete - Proceed to Quiz"

---

## 6. Quiz Section

### Quiz Card Structure

#### Quiz Information Display
- **Title**: Quiz name (e.g., "Acts in Action Week 1 Quiz")
- **Details**: Questions count, time limit, passing score
- **Final Exam**: Special styling with essay component info

#### Quiz Status Badges
```typescript
// Not Attempted
<Badge>Available</Badge>

// Attempted but Failed
<Badge variant="destructive">
  Failed ({score}%) - Retake Available
</Badge>

// Passed
<Badge className="bg-green-600">
  Passed ({score}%) ✓
</Badge>

// Locked
<Badge variant="secondary">
  Locked - {getCompletionMessage(weekNumber, 'quiz')}
</Badge>
```

### Quiz Access Logic

#### `canAccessQuiz(weekNumber, isFinalExam)`
```typescript
// Final Exam: Requires ALL weeks completed
if (isFinalExam) {
  for (let week = 1; week <= maxWeek; week++) {
    if (!isWeekContentCompleted(week)) return false;
  }
  return true;
}

// Regular Quiz: Requires that week's content completed
return isWeekContentCompleted(weekNumber);
```

#### `isWeekContentCompleted(weekNumber)`
Checks:
1. **All videos** for that week are completed
2. **All readings** for that week are completed
3. Special handling for Course 1 (hardcoded reading IDs)
4. Special handling for Course 2 (audiobook + Bible)

### Quiz Button Functionality

#### Take Quiz Button
```typescript
onClick={() => setLocation(`/quiz/${quiz.id}`)}
```
- Navigates to quiz-taking page
- Quiz page handles attempt submission
- Progress tracked separately via quiz attempts API

#### Quiz Attempt Tracking
- **API**: `/api/quiz-attempts/course/${courseId}`
- **Data Structure**:
  ```typescript
  {
    id: number;
    studentId: string;
    quizId: number;
    score: number; // 0-1 (decimal)
    completedAt: string;
    timeSpent: number;
    passed: boolean;
  }
  ```

### Quiz Completion States
- **Not Attempted**: "📝 Take Quiz" button
- **Failed**: Shows score, "Retake Available" badge
- **Passed**: Green badge with score
- **Locked**: Disabled button with lock message

---

## 7. Progress Tracking System

### Database Schema
```sql
content_progress (
  id: serial PRIMARY KEY,
  student_id: varchar REFERENCES users(id),
  course_id: integer REFERENCES courses(id),
  content_type: varchar ('video' | 'reading' | 'quiz'),
  content_id: integer,
  completed: boolean DEFAULT false,
  completed_at: timestamp,
  created_at: timestamp DEFAULT NOW()
)
```

### Progress Tracking Flow

#### 1. Mark Content Complete
```typescript
POST /api/content-progress
Body: {
  courseId: number,
  contentType: 'video' | 'reading' | 'quiz',
  contentId: number,
  completed: true
}
```

#### 2. Backend Processing
```typescript
// server/storage.ts
async updateContentProgress(
  studentId: string,
  courseId: number,
  contentType: 'video' | 'reading' | 'quiz',
  contentId: number,
  completed: boolean
)
```
- Upserts progress record
- Updates `completed_at` timestamp if completing

#### 3. Frontend Refresh
```typescript
// After mutation success
queryClient.invalidateQueries({ 
  queryKey: [`/api/content-progress/${courseId}`] 
});
setForceRefresh(prev => prev + 1);
```

### Progress Checking Function
```typescript
const isContentCompleted = (
  contentType: 'video' | 'reading' | 'quiz',
  contentId: number
) => {
  // Special handling for Course 4 (G.R.O.W) - manual completions
  if (courseId === 4) {
    const manualKey = `${contentType}-${contentId}`;
    if (manualCompletions[manualKey]) return true;
  }
  
  // Check contentProgress array
  return contentProgress.some(
    (p) => p.contentType === contentType && 
           p.contentId === contentId && 
           p.completed
  );
};
```

---

## 8. Button Functionality

### Button Types

#### 1. **Watch Video Button**
- **State**: Enabled when video is accessible
- **Action**: Opens modal + marks complete
- **Styling**: Blue, play icon
- **Locked State**: Gray, disabled, shows lock message

#### 2. **Audiobook Button**
- **State**: Enabled when readings are accessible
- **Action**: Navigates to audiobook page + marks complete
- **Styling**: Blue gradient (`from-blue-600 to-purple-600`)
- **Completed State**: Green with checkmark

#### 3. **Bible Reading Button**
- **State**: Enabled when readings are accessible
- **Action**: Opens external link + marks complete
- **Styling**: Green outline (`border-green-300`)
- **Completed State**: Green background with checkmark

#### 4. **Take Quiz Button**
- **State**: Enabled when quiz is accessible
- **Action**: Navigates to `/quiz/${quizId}`
- **Styling**: Purple (`bg-purple-600`)
- **Locked State**: Gray, disabled, shows completion message

#### 5. **Enroll Button**
- **Location**: Course header
- **State**: Shows if not enrolled
- **Action**: `POST /api/enrollments`
- **Styling**: Purple gradient

### Button State Transitions

```
Video Button:
  Locked → Watch Video → [Opens Modal] → Completed ✓

Reading Button:
  Locked → Audiobook/Bible → [Opens Content] → Completed ✓

Quiz Button:
  Locked → Take Quiz → [Navigates] → [After Submission] → Passed/Failed
```

---

## 9. Completion States

### Visual Indicators

#### Badges
- **Locked**: Gray badge with lock icon
- **Completed**: Green badge "Completed - Proceed to Reading Section"
- **Passed Quiz**: Green badge with score
- **Failed Quiz**: Red badge with score

#### Button Colors
- **Available**: Primary color (blue/purple/green)
- **Completed**: Green (`bg-green-600`)
- **Locked**: Gray (`bg-gray-400`)

#### Card Styling
- **Accessible**: Full opacity, colored left border
- **Locked**: 60% opacity (`opacity-60`), gray border

### Completion Logic

#### Week Progression
```typescript
Week N unlocks when:
  - Week N-1 videos are ALL completed
  - Week N-1 readings are ALL completed
  - Week N-1 quiz is passed (for quiz access)
```

#### Reading Access
```typescript
Readings unlock when:
  - Week is accessible (previous week completed)
  - All videos for that week are completed (if videos exist)
```

#### Quiz Access
```typescript
Quiz unlocks when:
  - Week is accessible
  - ALL videos for that week are completed
  - ALL readings for that week are completed
```

---

## 10. Quiz Structure

### Quiz Data Model
```typescript
interface Quiz {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  timeLimit: number | null; // minutes
  passingScore: number; // 0-100
  isPublished: boolean;
  isFinalExam: boolean;
  orderIndex: number;
  questions: number;
}
```

### Quiz Filtering Logic
Quizzes are filtered by course using title patterns:
```typescript
// Course 1 (Acts in Action)
quizzes.filter(q => q.title.includes('Acts in Action') || 
                    q.title.includes('Acts Week'))

// Course 2 (Fire Starter)
quizzes.filter(q => q.title.includes('Fire Starter'))

// Course 3 (Don't Be a Jonah)
quizzes.filter(q => q.title.includes('Jonah') || 
                    q.title.includes('DBAJ'))
```

### Quiz Sorting
```typescript
quizzes.sort((a, b) => {
  // Final exams last
  if (a.isFinalExam && !b.isFinalExam) return 1;
  if (!a.isFinalExam && b.isFinalExam) return -1;
  
  // Sort by week number
  const aWeek = parseInt(a.title.match(/Week (\d+)/)?.[1] || '0');
  const bWeek = parseInt(b.title.match(/Week (\d+)/)?.[1] || '0');
  if (aWeek !== bWeek) return aWeek - bWeek;
  
  // Then by ID
  return a.id - b.id;
});
```

### Quiz Attempt Tracking
- **API**: `/api/quiz-attempts/course/${courseId}`
- **Authentication**: Bearer token from localStorage
- **Data**: Array of quiz attempts with scores

### Final Exam Special Handling
- **Requirement**: ALL weeks' content must be completed
- **Styling**: Red border, gradient background
- **Essay Component**: Mentioned in description
- **Certificate**: Sent via email after review

---

## 11. Data Flow

### Initial Page Load
```
1. User navigates to /course/1
2. CourseDetail component mounts
3. Fetches course data: GET /api/courses/1
4. Checks enrollment: GET /api/enrollments/student
5. If enrolled, renders CourseContentViewer
6. CourseContentViewer fetches:
   - Videos: GET /api/courses/1/videos
   - Readings: GET /api/courses/1/readings
   - Quizzes: GET /api/student/quizzes/all
   - Progress: GET /api/content-progress/1
   - Quiz Attempts: GET /api/quiz-attempts/course/1
```

### Progress Update Flow
```
1. User clicks "Watch Video" button
2. Video modal opens
3. Mutation triggered: POST /api/content-progress
4. Backend updates database
5. Frontend invalidates queries
6. UI refreshes with new completion state
7. Next week may unlock if all content completed
```

### Quiz Completion Flow
```
1. User clicks "Take Quiz" button
2. Navigates to /quiz/{quizId}
3. User completes quiz
4. Quiz submission: POST /api/quizzes/{quizId}/submit
5. Returns score and pass/fail status
6. User returns to course page
7. Quiz attempts query refreshes
8. Badge updates to show pass/fail
```

---

## 12. API Endpoints

### Course Data
- `GET /api/courses/:id` - Course information
- `GET /api/courses/:id/videos` - Course videos
- `GET /api/courses/:id/readings` - Course readings

### Progress Tracking
- `GET /api/content-progress/:courseId` - Get all progress
- `POST /api/content-progress` - Update progress
  ```json
  {
    "courseId": 1,
    "contentType": "video",
    "contentId": 5,
    "completed": true
  }
  ```

### Enrollment
- `GET /api/enrollments/student` - Get student enrollments
- `POST /api/enrollments` - Enroll in course
  ```json
  {
    "courseId": 1
  }
  ```

### Quizzes
- `GET /api/student/quizzes/all` - Get all quizzes
- `GET /api/quiz-attempts/course/:courseId` - Get quiz attempts
- `POST /api/quizzes/:id/submit` - Submit quiz (on quiz page)

---

## Key Functions Reference

### `extractWeekNumber(title: string)`
Extracts week number from content title:
- Looks for "Week X" pattern
- Handles "Final Exam" (week 11)
- Handles "Reflection Essay" (week 12)
- Falls back to orderIndex if no pattern found

### `canAccessWeek(weekNumber: number)`
Checks if a week is accessible:
- Week 1 is always accessible
- Other weeks require previous week's content completion

### `canAccessReadings(weekNumber: number)`
Checks if readings are accessible:
- Week must be accessible
- All videos for that week must be completed (if videos exist)

### `canAccessQuiz(weekNumber: number, isFinalExam: boolean)`
Checks if quiz is accessible:
- Regular quiz: Week content must be completed
- Final exam: ALL weeks' content must be completed

### `isWeekContentCompleted(weekNumber: number)`
Checks if all content for a week is done:
- All videos completed
- All readings completed
- Special handling for Course 1 and Course 2

### `getCompletionStats()`
Calculates completion statistics:
- Counts completed videos/readings/quizzes
- Special handling per course (different totals)
- Returns: `{ videos: {completed, total}, readings: {...}, quizzes: {...} }`

---

## Special Course Handling

### Course 1 (Acts in Action)
- **Readings**: Hardcoded IDs per week (1-21)
- **Videos**: 10 weeks
- **Quizzes**: 11 total (10 weekly + 1 final)

### Course 2 (Fire Starter)
- **Readings**: Database audiobook + hardcoded Bible readings
- **Videos**: May not have videos
- **Quizzes**: 11 total

### Course 3 (Don't Be a Jonah)
- **Videos**: Only weeks 1, 3, 5, 7, 9
- **Readings**: Fully hardcoded structure
- **Quizzes**: 12 total (11 weekly + 1 final)

### Course 4 (G.R.O.W)
- **Videos**: None
- **Readings**: 4 weeks
- **Quizzes**: 5 total
- **Special**: Manual completion tracking for cache issues

### Course 6 (Deacon Course)
- **Videos**: None
- **Readings**: 5 chapters
- **Quizzes**: 6 total

### Course 7 (Level Up Leadership)
- **Videos**: All accessible (no week locking)
- **Styling**: Purple theme
- **Readings**: Required book purchase links

### Course 8 (Youth Ministry)
- **Videos**: None
- **Readings**: 5 chapters
- **Quizzes**: 6 total

---

## Error Handling

### API Errors
- **401 Unauthorized**: Redirects to login
- **404 Not Found**: Shows "Course Not Found" message
- **500 Server Error**: Shows error toast

### Progress Update Failures
- Shows error toast
- Logs error to console
- Does not prevent navigation (graceful degradation)

### Quiz Attempt Errors
- Handled on quiz page
- Returns to course page with error state

---

## Performance Considerations

### Query Caching
- **Videos/Readings**: 5-minute cache (except Course 4)
- **Progress**: No cache (`staleTime: 0, gcTime: 0`)
- **Quizzes**: No cache

### Force Refresh Mechanism
- `forceRefresh` state counter
- Increments on progress updates
- Forces query refetch

### Manual Completions (Course 4)
- Fallback system for cache issues
- Loads from API on mount
- Stores in local state

---

## Conclusion

The course page is a complex, feature-rich component with:
- **Week-based progression system**
- **Comprehensive progress tracking**
- **Multiple content types** (videos, readings, quizzes)
- **Special handling per course**
- **Real-time UI updates**
- **Robust error handling**

The system uses React Query for data management, with careful attention to caching and refresh strategies. The progression logic ensures students complete content in order, with clear visual feedback at every step.




























