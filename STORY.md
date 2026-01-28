Title: The Neon Orchard

A single-sentence opener:
The city dreams of electricity; Mara dreams of trees.

Overview:
In a near-future coastal city of chrome and rain, an urban horticulturist named Mara discovers a pocket of impossible soil beneath an abandoned tram depot. She cultivates a luminous orchard of bioluminescent fruit that responds to memory. Each fruit contains a short interactive scene — a memory-scape — the player can enter to recover clues about a decades-old disappearance. As the orchard grows, the city notices: corporate harvesters, municipal regulators, and a whispering net of memory-collectors converge, each with their own motives.

Gameplay hook:
Players must grow and curate the orchard, choosing which memories to feed and prune. Entering a fruit's memory-scape becomes a short playable vignette (choices + skill checks) that reveals narrative fragments and puzzle tokens. Some fruits are corrupted — their memories are false or dangerous. The orchard's health links to the protagonist's empathy: tending to others' memories strengthens growth.

Key characters:
- Mara (player character): A resourceful horticulturist with a damaged implant that blurs her own memories. Motivations: redemption, truth, making beauty where the city razes it.
- Yusef: An archivist who trades fragments on the black market. Helpful but secretive.
- Director Asha Venn: Corporate head of urban reclamation; publicly funds green projects but privately contracts memory-mining firms.
- The Missing: A network of activists lost years ago; their final acts are tangled among the orchard's fruits.

Core mechanics:
- Cultivation: Plant seeds (found/foraged), water, and amplify with light rhythms. Each care action shifts the memory-strings the fruit holds (tone: joyful, traumatic, mundane, coded).
- Memory-scapes: Short scenes playable as interactive fiction with branching outcomes. Choices award clue fragments or corruptive residue.
- Synthesis: Combine fragments at a workshop to decode puzzle tokens that unlock deeper orchard roots.
- Reputation & Risk: Grow too public, and harvesters come; be too secret, and memories rot. Balance social, stealth, and outreach mechanics.

Level/Story beats:
1) Devotion: Mara finds the depot and plants the first seed, meeting Yusef who hints at the Missing.
2) First Harvest: The first fruits reveal overlapping memories pointing to a community garden turned protest site.
3) Corruption: A corporate probe samples a fruit, causing a memory leak that attracts attention.
4) Roots: Synthesis reveals coordinates and a name; Mara confronts the ethics of releasing memories publicly.
5) Orchard War: A showdown with Director Venn's harvesters; players must decide to share, hide, or weaponize memories.
6) Resolution: Multiple endings depending on whether Mara restores truth, buries the orchard, or merges her identity with the city’s memory-net.

Art & Sound direction:
- Visuals: Rain-damp neon, organic fractal trees with glowing fruit; memory-scapes shift palettes to match emotion.
- Sound: Layered ambient synths + sampled natural textures; fruit tones as distinct melodic motifs.

Implementation notes for the repo:
- STORY.md replaces the existing long form narrative. Keep original structure: the game engine reads STORY.md to populate fruit templates and memory tags.
- New content added: a 'fruits/' folder under src/content containing 8 JSON memory templates (short scenes + choices) and a seeds metadata file.
- Gameplay tuning: provide simple sample scripts in src/content/ai_new_story_loader.js that parse STORY.md and the JSON templates into the existing story system.

Example fruit JSON (one sample saved to src/content/fruits/lumina-1.json):
{
  "id": "lumina-1",
  "title": "First Light",
  "tone": "wistful",
  "scene": [
    {"text": "You stand beneath a metal canopy. A child tosses a paper boat into a puddle.", "choices": [{"text":"Follow the boat","result":"clue:boat"},{"text":"Call out","result":"mood:connection"}]}
  ]
}

