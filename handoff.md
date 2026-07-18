# Subject: BemaHub OBS Presentation — Design and Scene Handoff

Hi,

I’ve completed the latest design and UI updates for the BemaHub Open Enrollment OBS presentation.

The main focus was to make the scenes match their storyboard references more closely and ensure that titles, presenter/profile areas, cards, icons, images, bullet points, and important figures remain clearly visible when displayed on a large screen.

## Work completed

- Rebuilt and refined the required presentation scenes as coded UI instead of displaying the storyboard images directly.
- Updated scenes 18, 21, 23–24, 26–37, and 39 to better match their individual references.
- Corrected scene 23 to use shorter vertical cards.
- Corrected scene 24 to use three large standalone cards positioned on the right.
- Added the required event imagery, creator photography, profile images, icons, schedules, metrics, activity feeds, QR codes, and action cards where needed.
- Made titles and important content significantly larger for big-screen presentation.
- Kept the presenter/profile areas large and unobstructed for the live OBS camera source.
- Made the bullet-point sections in scenes 18 and 27 clearly visible and readable.
- Improved the creator profile, Participation Assets, Creator Proof, and Access Levels sections in scene 18.
- Improved the FAQ layouts in scenes 33 and 36 with larger questions and answers.
- Improved the enrollment, progress, leaderboard, closing, and call-to-action scenes with clearer visual hierarchy.
- Updated scenes 2 and 5 to use the same footer background treatment as scene 1.
- Corrected footer item spacing across scenes 06–22 so the items have equal widths and are centered horizontally and vertically.
- Used Tailwind CSS heavily for the scene layouts and styling.

## OBS setup note

The empty presenter areas on the left side of the relevant scenes are intentional. They are reserved for the live presenter camera source in OBS.

The correct OBS source order is:

1. Underlay browser source
2. Presenter camera source
3. Foreground browser source

Both browser sources should be set to 1920×1080. Final OBS URLs should include `clean=true` so development controls are hidden.

## Verification

- Reviewed the updated scenes using the final 1920×1080 OBS composite output.
- Checked titles, profiles, bullet points, cards, QR codes, footers, and safe areas for visibility and overflow.
- Confirmed the production build completes successfully.
- The completed presentation implementation is available on the `joshua-update` branch and is synced with the remote branch.

The presentation is ready for final review and OBS integration.

Best,

Joshua
