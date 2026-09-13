# Product hierarchy

- Keep chat upload the primary action on the first screen. Tone and photo preferences belong in the dialog opened by upload; the slide preview is secondary.
- Keep the three export/upload/save steps near the upload action. Place the detailed Telegram JSON export instructions in the first step.
- Keep the repository private unless the user explicitly requests a visibility change.
- Treat the landing and result slides as separate design decisions. Use flat mood palettes in the landing carousel, without fictitious chat statistics or demo cats.
- Describe the product as turning chat conversations into entertaining facts, rather than archiving or summarizing important messages.
- Keep landing and upload-dialog typography to 14, 16, and 24px, with only the hero headline exempt. Use weight and spacing rather than extra text sizes.
- Open mood selection from the primary upload button; do not add a separate settings action to the landing. Default to the first, calm mood.
- In results, make the slide the primary full-viewport surface. Keep navigation, download and exit controls quiet; do not repeat import preferences or the chat-name header above the slide.
- Mood changes must alter slide composition and visual language, not just copy: calm is factual, friendly uses expressive emoji and playful awards, roast emphasizes punchlines and contrast. Refer to the preserved original ChatWrapped/ChatRoasted sources for character.
- Photo slides fill the whole slide with centered cover cropping; keep only a small centered author credit at the bottom.
- Use flat colours for all mood slides and landing previews; do not restore illustrative background artwork. Preserve the friendly pastel palette. Sharp slides use a separate split composition: a large meaning-driven punchline and expressive emoji on the left, factual evidence on the right. Use bold saturated colours, not the calm layout with a darker palette. Use the normal sans-serif for friendly captions, and place award emoji below the central fact.

- Landing carousel has exactly three previews, one per mood. Keep both headline lines centered without horizontal offsets; place logo and preview controls inside the hero. Privacy copy uses scene-aware text color, never a background badge.
- Design result slides for TV viewing: shared type sizes and stable title, fact and caption positions across comparable slides. Avoid clipping names, overlapping emoji, and placing text on busy artwork edges. Calm slides use a light neutral palette, not orange and black.
- Use Russian day-month-year dates such as “10 сентября 2026”. Omit terminal full stops in standalone slide captions.
- The photo switch has a white thumb. Do not restore the removed “Добавить фотографии из чата” helper text.

- The landing scene reaches the top, left and right viewport edges. Keep carousel controls near its bottom and align their left/right bounds with the instruction content below. Instruction headings have a 4px gap to their supporting text.

- Align calm slide captions to the left edge of their content.

- In roast slides, align the winner name, number and unit to the same left edge as the participant list. Use very dark warm backgrounds with red, orange, amber and yellow accents; avoid green, violet and pink roast palettes.

# Mood and emoji direction

- Calm slides are maximally neutral, dry and businesslike: no emoji, jokes, sarcasm or evaluative characterizations.
- Friendly slides are warm and gentle, with light humour and mandatory emoji. Charts may omit emoji; do not extend that exception to all dense slide types.
- Roast slides are deliberately emotional, biting, sarcastic and exaggerated to the point of cringe. Write pointed jokes about the observed chat habits, with expressive emoji that reinforce the punchline.
- Friendly and roast need distinct emoji choices as well as distinct copy and composition. Choose by meaning: warm/supportive cues such as 🫶, 🥹 and ✨ for friendly; mocking, incredulous or overwhelmed reactions such as 🤡, 💀, 🥴, 🙄 and 🤦 for roast. Do not reuse one emoji mapping across these two moods or put the same generic emoji on every slide.
- Keep the source facts consistent across moods. These tone rules are design requirements; passing technical checks does not establish that the resulting design has been accepted.
- Friendly result flow starts with the general overview. Center the overview content. On friendly award cards, place the emoji first, then the value and unit, then the participant name. Media rankings use one meaningful icon per row; the words slide places its emoji below the heading instead of floating beside the list.
