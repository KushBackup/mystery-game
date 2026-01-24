import React from 'react';

export const HelpView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-halloween-orange to-halloween-pink p-6 rounded-2xl border-4 border-white shadow-halloween">
        <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🎃 Welcome Detective! 🎃
        </h2>
        <p className="text-white text-center font-semibold">
          Your ultimate guide to solving the mystery
        </p>
      </div>

      {/* Game Overview */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🕵️ What's Happening?
        </h3>
        <div className="space-y-2 text-white">
          <p className="leading-relaxed">
            You're at a mysterious party where something terrible has happened. As one of the guests, you have a unique perspective on the events that unfolded. Your mission: work with other players to uncover the truth!
          </p>
          <p className="leading-relaxed">
            The game progresses through <strong className="text-halloween-yellow">7 rounds</strong> (0-6), with new information revealed at each stage. Pay attention to what you learn, share your insights, and piece together the puzzle.
          </p>
        </div>
      </div>

      {/* Navigation Guide */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🧭 Navigating the App
        </h3>
        <div className="space-y-3 text-white">
          <div className="bg-black/30 p-3 rounded-xl">
            <p className="font-bold text-halloween-orange mb-1">🏠 Home Screen (Tile Grid)</p>
            <p className="text-sm">This is your hub! Tap any colorful tile to open that section. The large red ID tile is your character card - check it first!</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl">
            <p className="font-bold text-halloween-orange mb-1">❌ Close Button (Top Right)</p>
            <p className="text-sm">See that red circle with an X? Tap it anytime to return to the home screen.</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl">
            <p className="font-bold text-halloween-orange mb-1">📊 Round Display (Top)</p>
            <p className="text-sm">The current round number shows at the top. New content unlocks as rounds progress!</p>
          </div>
        </div>
      </div>

      {/* Screen Guide */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          📱 What Each Screen Does
        </h3>
        <div className="space-y-3 text-white">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">🆔 ID CARD</p>
            <p className="text-sm">Your character identity! See your role, profession, backstory, and secret. This is WHO you are in the story. Share your access code with others to introduce yourself!</p>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">🔍 CLUES</p>
            <p className="text-sm">Your evidence board! All the clues you've unlocked appear here. In Round 1+, you'll see YOUR accusation card - this is what YOUR character witnessed. Use the floating orange button to enter codes from printed cards.</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">💬 CHAT</p>
            <p className="text-sm">Talk to ALL players in real-time! Share theories, ask questions, compare alibis. Every message shows who sent it, so you can track who says what.</p>
          </div>

          <div className="bg-gradient-to-r from-pink-600 to-red-500 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">🗳️ VOTES</p>
            <p className="text-sm">When voting opens, pick who you think is responsible. Tap a suspect card, then tap "CONFIRM VOTE". You can change your vote anytime before the host closes voting. Vote counts update live!</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">📁 FILES</p>
            <p className="text-sm">Official case files and documents unlocked by the host at specific rounds. These contain crucial forensic evidence, witness statements, and reports. Study them carefully!</p>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl border-2 border-white">
            <p className="font-black text-lg mb-2">👥 GUESTS</p>
            <p className="text-sm">Browse all 32 party guests! Tap anyone to see their full profile, including their profession and background. Use this to understand everyone's connections to the victim.</p>
          </div>
        </div>
      </div>

      {/* Code Entry System */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🔢 Entering Codes
        </h3>
        <div className="space-y-3 text-white">
          <div className="bg-black/30 p-4 rounded-xl">
            <p className="font-bold text-halloween-orange mb-2">📱 How to Use the Decoder</p>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li>Open the <strong>CLUES</strong> screen</li>
              <li>Look for the floating orange calculator button (bottom right)</li>
              <li>Tap it to open the code entry window</li>
              <li>Type the code from your printed card (case doesn't matter)</li>
              <li>Hit SUBMIT or press Enter</li>
            </ol>
          </div>

          <div className="bg-black/30 p-4 rounded-xl">
            <p className="font-bold text-halloween-orange mb-2">🎴 Types of Codes</p>
            <ul className="space-y-2 text-sm">
              <li><strong className="text-green-400">✓ Motive Codes:</strong> Reveal why suspects wanted the victim dead (Round 2+)</li>
              <li><strong className="text-purple-400">✓ Revelation Codes:</strong> Major plot twists and discoveries (Round 4+)</li>
              <li><strong className="text-red-400">⏰ Locked Codes:</strong> If you enter a code too early, it won't work yet. Wait for the right round!</li>
            </ul>
          </div>

          <div className="bg-orange-900/50 p-3 rounded-xl border-2 border-orange-600">
            <p className="font-bold text-orange-300 text-sm">
              💡 TIP: The host will give you physical cards with codes throughout the game. Keep them safe!
            </p>
          </div>
        </div>
      </div>

      {/* Voting System */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🗳️ How Voting Works
        </h3>
        <div className="space-y-3 text-white">
          <div className="bg-black/30 p-4 rounded-xl">
            <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
              <li className="mb-2"><strong>Wait for voting to open</strong> - The host controls when voting begins</li>
              <li className="mb-2"><strong>Open the VOTES screen</strong> - You'll see all 10 suspects</li>
              <li className="mb-2"><strong>Tap your suspect</strong> - Pick who you think is guilty</li>
              <li className="mb-2"><strong>Confirm your vote</strong> - A button appears, tap it to lock in your choice</li>
              <li className="mb-2"><strong>Change anytime</strong> - You can vote again to change your pick</li>
              <li className="mb-2"><strong>See results</strong> - When the host reveals results, tap "VIEW VOTE RESULTS" to see the graph</li>
            </ol>
          </div>

          <div className="bg-green-900/50 p-3 rounded-xl border-2 border-green-600">
            <p className="font-bold text-green-300 mb-2">✅ Vote Counts Are Live!</p>
            <p className="text-sm text-green-200">
              Everyone can see how many votes each suspect has in real-time. Your vote is marked with a green ring so you know who you picked.
            </p>
          </div>
        </div>
      </div>

      {/* Game Flow */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          ⏰ The Game Structure
        </h3>
        <div className="space-y-3 text-white">
          <p className="text-sm leading-relaxed">
            The game unfolds over <strong className="text-halloween-yellow">7 rounds</strong>, each lasting about 15-20 minutes. The host controls when rounds advance and what content unlocks.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">0️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 0: The Incident</p>
                <p className="text-sm">Read the incident report and get to know the characters</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 1: Accusations</p>
                <p className="text-sm">You'll receive YOUR accusation card - what you witnessed!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 2: Motives</p>
                <p className="text-sm">Enter motive codes to learn why suspects had reasons to act</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 3: Evidence</p>
                <p className="text-sm">Forensic reports and witness statements are revealed</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">4️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 4: Revelations</p>
                <p className="text-sm">Major plot twists! Enter revelation codes for shocking discoveries</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">5️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 5: Finale</p>
                <p className="text-sm">Final discussion and debate before the big reveal</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-black/30 p-3 rounded-xl">
              <span className="text-2xl">6️⃣</span>
              <div>
                <p className="font-bold text-halloween-orange">Round 6: The Reveal</p>
                <p className="text-sm">The truth comes out. Final votes and resolution!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detective Tips */}
      <div className="bg-gradient-to-br from-halloween-purple to-purple-900 border-4 border-halloween-orange rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-halloween-yellow mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🕵️ Detective Tips
        </h3>
        <div className="space-y-2 text-white">
          <div className="flex items-start gap-2">
            <span className="text-xl">🔍</span>
            <p className="text-sm"><strong>Read Everything:</strong> Every clue, file, and profile matters. Small details can crack the case!</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">💬</span>
            <p className="text-sm"><strong>Use the Chat:</strong> Share what you know, ask questions, and compare notes with other players.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">👥</span>
            <p className="text-sm"><strong>Study the Guests:</strong> Look at relationships, professions, and backgrounds. Who had access? Who had motive?</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">⏰</span>
            <p className="text-sm"><strong>Check Timelines:</strong> When did things happen? Who was where? Alibis are crucial!</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🎭</span>
            <p className="text-sm"><strong>Play Your Role:</strong> Stay in character! Your character's perspective is unique and valuable.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🤝</span>
            <p className="text-sm"><strong>Work Together:</strong> This is a collaborative game. The goal is for the group to solve it together!</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🧩</span>
            <p className="text-sm"><strong>Connect the Dots:</strong> Look for patterns. How do different clues fit together?</p>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 border-4 border-white rounded-2xl p-5 shadow-halloween">
        <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          ⚠️ Important Notes
        </h3>
        <div className="space-y-2 text-white">
          <div className="flex items-start gap-2">
            <span className="text-xl">🔒</span>
            <p className="text-sm"><strong>Stay Patient:</strong> Some clues are locked until later rounds. Trust the process!</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">📱</span>
            <p className="text-sm"><strong>Keep Your Device:</strong> You'll need your phone/tablet for the entire game.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🎴</span>
            <p className="text-sm"><strong>Save Your Cards:</strong> Don't lose the physical code cards you receive!</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🔄</span>
            <p className="text-sm"><strong>Real-Time Updates:</strong> Everything syncs automatically. What one player unlocks, everyone can see!</p>
          </div>
        </div>
      </div>

      {/* Final Encouragement */}
      <div className="bg-gradient-to-r from-halloween-yellow to-halloween-orange p-6 rounded-2xl border-4 border-white shadow-halloween text-center">
        <h3 className="text-3xl font-black text-halloween-dark mb-2" style={{ fontFamily: 'Fredoka, cursive' }}>
          🎉 Ready to Solve the Mystery? 🎉
        </h3>
        <p className="text-halloween-dark font-bold text-lg">
          Trust your instincts, work as a team, and have fun!
        </p>
        <p className="text-halloween-dark text-sm mt-2">
          The truth is out there... can you find it? 👻🔍
        </p>
      </div>
    </div>
  );
};
