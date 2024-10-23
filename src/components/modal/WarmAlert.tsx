import React, { useState } from 'react';
import Draggable from 'react-draggable';

interface WarmAlertProps {
  message: string;
  onClose: () => void;
  actionText: string; // 이 줄을 추가
}

const WarmAlert: React.FC<WarmAlertProps> = ({ message, onClose, actionText }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Draggable position={position} onDrag={handleDrag} handle=".handle">
        <div className="bg-amber-50 rounded-2xl shadow-lg" style={{ width: '100%', maxWidth: '20rem' }}>
          <div className="handle bg-amber-400 p-3 rounded-t-2xl cursor-move flex justify-between items-center">
            <span className="text-amber-800 font-semibold">알림</span>
            <button
              onClick={onClose}
              className="text-amber-800 hover:text-amber-900 transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <p className="text-amber-800 text-lg mb-4">{message}</p>
            <button
              onClick={onClose}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
            >
              확인
            </button>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default WarmAlert;
