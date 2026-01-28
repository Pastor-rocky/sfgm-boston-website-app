# Instructor and Church Information

## Church affiliation — registration only
- **Where:** Registration page (`/register`).
- **When:** Collected once at signup via **SFGM Church** dropdown.
- **Storage:** `users.sfgm_church`.

### SFGM churches list
Each church has **church name**, **city (abbreviated)**, **state (abbreviated)**, and **default instructor**:

| Church | City | State | Default instructor |
|--------|------|-------|--------------------|
| SFGM Orlando | Orlando | FL | Pastor Anthony Lee |
| SFGM Ft. Lauderdale | Ft. Lauderdale | FL | Pastor Mark |
| SFGM Atlanta | Atlanta | GA | Pastor Skippy |
| SFGM Virginia | Virginia | VA | Pastor Frank |
| SFGM Baltimore | Baltimore | MD | Pastor Aaron |
| SFGM Columbus | Columbus | OH | Pastor Kevin |
| SFGM Pittsburgh | Pittsburgh | PA | Pastor Tommy |
| SFGM Cleveland | Cleveland | OH | Pastor Gino |
| SFGM New York | New York | NY | Pastor Steve |
| SFGM Dallas | Dallas | TX | Pastor Angelo |
| SFGM Detroit | Detroit | MI | Pastor Nick |
| SFGM Chicago Downtown | Chicago | IL | Pastor David |
| SFGM Chicago | Chicago | IL | Pastor Kevin |
| SFGM Boston | Boston | MA | Pastor Rocky |
| SFGM Arizona | Phoenix | AZ | Pastor John |
| SFGM Montana | Billings | MT | Pastor Tiger |
| SFGM Salt Lake City | Salt Lake City | UT | Pastor Kevin |
| SFGM Temecula | Temecula | CA | Pastor Joe |
| SFGM Boise | Boise | ID | Pastor Robert |
| SFGM Portland | Portland | OR | Pastor Michael |
| SFGM Arlington/Ft. Worth | Arlington | TX | Pastor Angelo |

Options are defined in `client/src/lib/sfgm-churches.ts`. Dropdown format:  
`SFGM Orlando (Orlando, FL) — Pastor Anthony Lee`.

---

## Instructor — dashboard course cards only
- **Where:** Student dashboard → each enrolled **course card** (e.g. Level Up Leadership).
- **What:** “Instructor” dropdown to **choose instructor** for that course.
- **Storage:** `enrollments.chosen_instructor_id`.

Multiple instructors per city/course are supported; students select their instructor per enrollment.

---

## APIs
- `GET /api/instructors` — list instructors for the dropdown.
- `PATCH /api/enrollments/:id` — body `{ chosenInstructorId?: string | null }` to update selected instructor.

---

## Removed
- Church selection and “Other” input have been **removed from dashboard course cards**. Church is **only** on registration.
