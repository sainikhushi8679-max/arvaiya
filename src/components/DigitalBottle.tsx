import React from 'react';
import { motion } from 'motion/react';
import { Fragrance } from '../types';

interface DigitalBottleProps {
  fragrance: Fragrance;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  view?: 'front' | 'side' | 'perspective';
}

export default function DigitalBottle({ 
  fragrance, 
  size = 'md', 
  active = false,
  view = 'front'
}: DigitalBottleProps) {
  // Size-specific adjustments
  const sizes = {
    xs: {
      container: 'h-48 w-32',
      capHeight: 'h-8',
      capWidth: 'w-10',
      neckHeight: 'h-2',
      neckWidth: 'w-6',
      bodyHeight: 'h-28',
      bodyWidth: 'w-24',
      labelWidth: 'w-16',
      labelHeight: 'h-12',
      labelPadding: 'p-0.5',
      brandSize: 'text-[5px]',
      nameSize: 'text-[6px]',
      detailsSize: 'text-[4px]'
    },
    sm: {
      container: 'h-64 w-44',
      capHeight: 'h-11',
      capWidth: 'w-14',
      neckHeight: 'h-3',
      neckWidth: 'w-8',
      bodyHeight: 'h-40',
      bodyWidth: 'w-32',
      labelWidth: 'w-24',
      labelHeight: 'h-18',
      labelPadding: 'p-1',
      brandSize: 'text-[7px]',
      nameSize: 'text-[9px]',
      detailsSize: 'text-[5px]'
    },
    md: {
      container: 'h-80 w-52',
      capHeight: 'h-14',
      capWidth: 'w-18',
      neckHeight: 'h-3.5',
      neckWidth: 'w-10',
      bodyHeight: 'h-52',
      bodyWidth: 'w-42',
      labelWidth: 'w-30',
      labelHeight: 'h-24',
      labelPadding: 'p-1.5',
      brandSize: 'text-[9px]',
      nameSize: 'text-[11px]',
      detailsSize: 'text-[6px]'
    },
    lg: {
      container: 'h-96 w-64',
      capHeight: 'h-16',
      capWidth: 'w-22',
      neckHeight: 'h-4',
      neckWidth: 'w-12',
      bodyHeight: 'h-64',
      bodyWidth: 'w-50',
      labelWidth: 'w-36',
      labelHeight: 'h-30',
      labelPadding: 'p-2',
      brandSize: 'text-[11px]',
      nameSize: 'text-[13px]',
      detailsSize: 'text-[7px]'
    }
  };

  const config = sizes[size];

  // Helper function to extract numbers from Tailwind config strings like 'h-11' or 'w-14'
  const getNum = (val: string): number => {
    const match = val.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Side view and Perspective view overrides
  const isSide = view === 'side';
  const isPerspective = view === 'perspective';

  const capWidth = isSide ? getNum(config.capWidth) * 0.4 : getNum(config.capWidth);
  const neckWidth = isSide ? getNum(config.neckWidth) * 0.45 : getNum(config.neckWidth);
  const bodyWidth = isSide ? getNum(config.bodyWidth) * 0.38 : getNum(config.bodyWidth);
  const labelWidth = isSide ? getNum(config.labelWidth) * 0.2 : getNum(config.labelWidth);

  // Whether this bottle's theme is dark or light
  const isDarkLabel = fragrance.labelBg.includes('bg-neutral-900') || fragrance.labelBg.includes('bg-stone-900') || fragrance.labelBg.includes('bg-slate-900');

  return (
    <div 
      className={`relative flex flex-col items-center justify-center ${config.container} select-none mx-auto transition-all duration-700`}
      style={{
        perspective: isPerspective ? '1000px' : undefined,
        transformStyle: isPerspective ? 'preserve-3d' : undefined,
      }}
    >
      {/* Background Soft Glow to represent the scent */}
      <div 
        className="absolute inset-0 rounded-full filter blur-[45px] opacity-25 transition-all duration-1000 ease-in-out"
        style={{ backgroundColor: fragrance.capColor }}
      />

      <motion.div
        className="flex flex-col items-center justify-center w-full h-full"
        animate={{
          rotateY: isPerspective ? [18, 26, 18] : 0,
          rotateX: isPerspective ? [5, 11, 5] : 0,
          y: active ? [0, -3, 0] : 0
        }}
        transition={{
          repeat: Infinity,
          duration: isPerspective ? 6 : 4,
          ease: "easeInOut"
        }}
        style={{
          transformStyle: isPerspective ? 'preserve-3d' : undefined,
        }}
      >
        {fragrance.imageUrl && !isSide ? (
          <div className="relative flex flex-col items-center justify-center transition-all duration-500 p-4">
            {/* Ambient behind-glow */}
            <div 
              className="absolute inset-0 rounded-full filter blur-[35px] opacity-25 -z-10 animate-pulse"
              style={{ backgroundColor: fragrance.liquidColor || fragrance.capColor }}
            />
            
            {/* The high-fidelity bottle photo */}
            <img 
              src={fragrance.imageUrl} 
              alt={fragrance.name}
              className="max-h-[190px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)] select-none pointer-events-none z-10 hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            
            {/* Digital circular holographic reticle behind bottle */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-amber-500/10 -z-10 animate-[spin_40s_linear_infinite]" />
            <div className="absolute w-[140px] h-[140px] rounded-full border border-dotted border-amber-500/5 -z-10 animate-[spin_20s_linear_infinite_reverse]" />

            {/* Scrolling digital scanner line to make it look "Digital" / "AI Scanned" */}
            <motion.div 
              className="absolute left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent shadow-[0_0_6px_rgba(245,158,11,0.5)] z-20 pointer-events-none"
              animate={{
                top: ['10%', '90%', '10%']
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Digital overlay text / wireframe readouts */}
            <div className="absolute -left-12 top-10 flex flex-col items-end z-10 pointer-events-none opacity-60">
              <span className="font-mono text-[7px] text-amber-500/70 tracking-widest uppercase">SYS.MODEL: 100ML</span>
              <span className="font-mono text-[6px] text-neutral-500 tracking-wider">EAU DE PARFUM</span>
            </div>
            
            <div className="absolute -right-12 bottom-12 flex flex-col items-start z-10 pointer-events-none opacity-60">
              <span className="font-mono text-[7px] text-amber-500/70 tracking-widest uppercase">SCAN_ACTIVE</span>
              <span className="font-mono text-[6px] text-neutral-500 tracking-wider">ARVAIYA_CORE</span>
            </div>

            {/* Bottom shadow base for 3D realism on the vanity display table */}
            <div className="absolute -bottom-2 w-[80%] h-2.5 bg-black/10 blur-[4px] rounded-full" />
            <div className="absolute -bottom-1.5 w-[50%] h-1.5 bg-black/15 blur-[1.5px] rounded-full" />
          </div>
        ) : (
          <>
            {/* 1. SIGNATURE TRANSLUCENT RECTANGULAR CAP (Exactly like image) */}
            <div className="relative z-20 flex flex-col items-center">
              <motion.div 
                className={`rounded-[2px] shadow-sm relative overflow-hidden border border-white/20`}
                style={{ 
                  height: `${getNum(config.capHeight) * 0.25}rem`,
                  width: `${capWidth * 0.25}rem`,
                  background: `linear-gradient(135deg, ${fragrance.capColor} 0%, rgba(255,255,255,0.1) 40%, ${fragrance.capColor} 100%)`,
                  boxShadow: `inset 0 0 10px rgba(255,255,255,0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Internal premium glass lines to match heavy physical appearance */}
                <div className="absolute inset-0 flex justify-between px-1 opacity-40">
                  <div className="w-[1px] h-full bg-white/60" />
                  {(!isSide) && <div className="w-[2px] h-full bg-white/20" />}
                  <div className="w-[1px] h-full bg-black/10" />
                  <div className="w-[1px] h-full bg-white/60" />
                </div>
                {/* Top light reflection cut */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-white/80" />
                {/* Lateral reflection cuts */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/40" />
                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/15" />
              </motion.div>
            </div>

            {/* 2. BRIGHT GOLD METALLIC SPRAY COLLAR / NECK */}
            <div 
              className="-mt-[1px] relative z-10 bg-gradient-to-r from-amber-100 via-yellow-400 to-amber-700 border-b border-amber-500 shadow-sm"
              style={{
                height: `${getNum(config.neckHeight) * 0.25}rem`,
                width: `${neckWidth * 0.25}rem`,
              }}
            >
              {/* Mirror metallic reflections */}
              <div className="absolute inset-y-0 left-1/4 w-[1px] bg-white/80" />
              <div className="absolute inset-y-0 right-1/4 w-[2px] bg-black/20" />
            </div>

            {/* 3. THICK GLASS RECTANGULAR BODY (Exactly like the heavy bottles in Arvaiya image) */}
            <div 
              className="relative z-10 bg-white/5 border-t border-x border-white/40 rounded-[4px] shadow-2xl flex flex-col items-center justify-end overflow-hidden transition-all duration-700 group cursor-pointer"
              style={{
                height: `${getNum(config.bodyHeight) * 0.25}rem`,
                width: `${bodyWidth * 0.25}rem`,
                borderBottomWidth: isSide ? '16px' : '14px', // Extra heavy glass thickness at the bottom
                borderBottomColor: 'rgba(255, 255, 255, 0.45)',
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 15px rgba(255,255,255,0.15)`
              }}
            >
              {/* Liquid level fill inside (Varies gracefully) */}
              <motion.div 
                className="absolute inset-0 origin-bottom transition-all duration-1000 ease-out"
                style={{ 
                  background: `linear-gradient(to top, ${fragrance.liquidColor} 0%, rgba(255,255,255,0.05) 90%)` 
                }}
                layoutId={`liquid-fill-${fragrance.id}`}
              >
                {/* Floating microscopic gold shimmers or subtle wave */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-white/30 blur-[0.5px]" />
                
                {/* Premium side reflection lines */}
                <div className="absolute left-[3px] top-2 bottom-4 w-[2px] bg-white/20 rounded blur-[0.5px]" />
                <div className="absolute right-[3px] top-2 bottom-4 w-[1.5px] bg-white/10 rounded blur-[0.5px]" />
                
                {/* Side glass depth overlay */}
                {isSide && (
                  <div className="absolute inset-x-1.5 top-0 bottom-0 border-x border-white/10" />
                )}
                
                {(!isSide) && (
                  <>
                    <div className="absolute left-[6px] top-10 bottom-12 w-[1px] bg-white/10 rounded blur-[1px]" />
                    <div className="absolute right-[6px] top-6 bottom-14 w-[1px] bg-white/15 rounded" />
                  </>
                )}
              </motion.div>

              {/* 4. PERFECT CENTER BRANDING LABEL (Matches image precisely) */}
              <div 
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[1px] border shadow-md flex flex-col items-center justify-between text-center select-none z-20 backdrop-blur-[1px] transition-all duration-500`}
                style={{
                  width: `${labelWidth * 0.25}rem`,
                  height: `${getNum(config.labelHeight) * 0.25}rem`,
                  backgroundColor: isDarkLabel ? 'rgba(15, 15, 15, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: isDarkLabel ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'
                }}
              >
                {/* Inner frame padding */}
                <div 
                  className={`w-full h-full border flex flex-col items-center justify-between ${config.labelPadding}`}
                  style={{
                    borderColor: isDarkLabel ? 'rgba(217, 119, 6, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {isSide ? (
                    // Elegant vertical golden line or thin spine text for side profile wrapper
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className={`w-[1px] h-full ${isDarkLabel ? 'bg-amber-500/40' : 'bg-neutral-800/40'}`} />
                    </div>
                  ) : (
                    <>
                      {/* INVARIANT BRAND LOGO & LEAF MARK */}
                      <div className="flex flex-col items-center">
                        {/* Stylized minimalist flower mark */}
                        <svg 
                          className={`w-2.5 h-2.5 mb-0.5 ${isDarkLabel ? 'text-amber-400' : 'text-neutral-800'}`}
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18c-3.5 0-6 3-6 7s6 11 6 11s6-7 6-11s-2.5-7-6-7z" />
                        </svg>
                        <span className={`font-serif tracking-[0.22em] font-extrabold leading-none ${config.brandSize} ${isDarkLabel ? 'text-amber-300' : 'text-neutral-900'}`}>
                          ARVAIYA
                        </span>
                        <div className={`w-6 h-[0.5px] mx-auto mt-0.5 ${isDarkLabel ? 'bg-neutral-800' : 'bg-neutral-200'}`} />
                      </div>

                      {/* FRAGRANCE NAME */}
                      <div className="my-1">
                        <span className={`font-serif tracking-wider font-semibold block uppercase leading-tight ${config.nameSize} ${isDarkLabel ? 'text-white' : 'text-neutral-800'}`}>
                          {fragrance.name}
                        </span>
                      </div>

                      {/* INVARIANT BOTTOM EAU DE PARFUM */}
                      <div className="flex flex-col items-center">
                        <span className={`tracking-[0.15em] leading-none uppercase block font-medium mb-0.5 opacity-80 ${config.detailsSize} ${isDarkLabel ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          EAU DE PARFUM
                        </span>
                        <span className={`tracking-wider leading-none block opacity-60 ${config.detailsSize} ${isDarkLabel ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          100 ml
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic Glass reflection/shine sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Subtle physical shadows and glass highlights overlay */}
              <div className="absolute inset-0 pointer-events-none border-b border-white/20" />
            </div>

            {/* Bottom shadow base for 3D realism on the vanity display table */}
            <div className="absolute -bottom-2 w-[80%] h-2.5 bg-black/10 blur-[4px] rounded-full" />
            <div className="absolute -bottom-1.5 w-[50%] h-1.5 bg-black/15 blur-[1.5px] rounded-full" />
          </>
        )}
      </motion.div>
    </div>
  );
}
