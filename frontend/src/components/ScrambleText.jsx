import { useState, useEffect, useRef } from 'react';

const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!#$&%?*+-=_/\\~';

export default function ScrambleText({
  words = ['any highlight', 'any reel', 'any stream', 'any podcast', 'any footage'],
  pauseDuration = 2400,
}) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);
  const [scrambleSuffix, setScrambleSuffix] = useState('');

  const targetWord = words[wordIdx];

  useEffect(() => {
    let timer = null;
    let scrambleInterval = null;
    let isCancelled = false;

    // Reset state for new word
    setDisplayText('');
    setScrambleSuffix('');

    let charIndex = 0;
    let ticks = 0;
    const totalChars = targetWord.length;

    // Fast scramble interval for the current letter being unlocked
    scrambleInterval = setInterval(() => {
      if (!isCancelled && charIndex < totalChars) {
        const rand = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        setScrambleSuffix(rand);
      } else {
        setScrambleSuffix('');
      }
    }, 30);

    // Letter locking loop
    const resolveNextChar = () => {
      if (isCancelled) return;

      if (charIndex < totalChars) {
        ticks++;
        // Every 3 ticks (~90ms), lock in the true character
        if (ticks >= 3) {
          charIndex++;
          ticks = 0;
          setDisplayText(targetWord.slice(0, charIndex));
        }
        timer = setTimeout(resolveNextChar, 32);
      } else {
        // GUARANTEE: Force exact full word to be displayed
        setDisplayText(targetWord);
        setScrambleSuffix('');
        clearInterval(scrambleInterval);

        // Hold complete full word
        timer = setTimeout(() => {
          if (isCancelled) return;
          // Delete characters cleanly
          let delCount = totalChars;
          const deleteStep = () => {
            if (isCancelled) return;
            if (delCount > 0) {
              delCount--;
              setDisplayText(targetWord.slice(0, delCount));
              timer = setTimeout(deleteStep, 25);
            } else {
              setWordIdx((prev) => (prev + 1) % words.length);
            }
          };
          deleteStep();
        }, pauseDuration);
      }
    };

    timer = setTimeout(resolveNextChar, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      clearInterval(scrambleInterval);
    };
  }, [wordIdx, targetWord, words.length, pauseDuration]);

  return (
    <span className="studio-scramble-wrapper">
      <span className="studio-scramble-text">
        <span className="studio-scramble-locked">{displayText}</span>
        {scrambleSuffix && (
          <span className="studio-scramble-active">{scrambleSuffix}</span>
        )}
      </span>
      <span className="studio-cursor" aria-hidden="true">█</span>
    </span>
  );
}
