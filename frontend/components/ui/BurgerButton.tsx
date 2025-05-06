import React from "react";

interface BurgerButtonProps {
  left: number | string;
  top?: number | string;
  onClick: () => void;
  isOpen?: boolean;
}

const BurgerButton: React.FC<BurgerButtonProps> = ({ left, top = 0, onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="fixed z-[60] flex flex-col items-center justify-center w-[64px] h-[64px] rounded-full border-2 border-[#003E1C] bg-[#232323] focus:outline-none transition-all duration-300"
      style={{ left, top }}
      aria-label="Ouvrir le menu"
    >
      <span className="block w-8 h-1 bg-white rounded mb-2"></span>
      <span className="block w-8 h-1 bg-white rounded mb-2"></span>
      <span className="block w-8 h-1 bg-white rounded"></span>
    </button>
  );
};

export default BurgerButton;
