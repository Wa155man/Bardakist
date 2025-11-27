import React from 'react';

interface HandwrittenLetterProps {
  char?: string;
  text?: string;
  className?: string;
  fontStyle?: string;
  strokeWidth?: number;
  showDirection?: boolean;
}

export const HandwrittenLetter: React.FC<HandwrittenLetterProps> = ({ 
  char, 
  text, 
  className = "", 
  fontStyle = 'playpen', // Default to Playpen Sans as requested
  strokeWidth = 6,
  showDirection = false
}) => {
  const content = text || char || "";

  // Determine Font Family
  let fontFamily = 'inherit';
  
  if (fontStyle === 'hand1') {
    fontFamily = "'Gveret Levin', cursive";
  } else if (fontStyle === 'playpen') {
    fontFamily = "'Playpen Sans Hebrew', cursive";
  } else if (fontStyle === 'alef') {
    fontFamily = "'Alef', sans-serif";
  } else if (fontStyle === 'print') {
    fontFamily = "'Varela Round', sans-serif";
  } else {
    // If unknown style passed, default to Playpen for handwriting context
    fontFamily = "'Playpen Sans Hebrew', cursive"; 
  }

  // For authentic "writing" feel, we strip Nikud
  const shouldStripNikud = (fontStyle === 'hand1' || fontStyle === 'playpen');
  
  const displayContent = shouldStripNikud
    ? content.replace(/[\u0591-\u05C7]/g, "") 
    : content;

  return (
    <span 
        style={{ fontFamily, fontWeight: 400, position: 'relative' }} 
        className={`inline-block ${className}`} 
        dir="rtl"
    >
      {displayContent}
      {/* 
        Note: True stroke direction would require SVG paths. 
        For now we just allow the prop to be passed without crashing.
        If showDirection is true, we could hypothetically overlay arrows here if we had the data.
      */}
    </span>
  );
};