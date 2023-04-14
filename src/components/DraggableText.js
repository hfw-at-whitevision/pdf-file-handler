import Draggable from "react-draggable";
import { FaCheck, FaTimes } from "react-icons/fa";
import { cleanBorder, errorColor, goodColor, primary45 } from "../utils/colors";
import { useState, useEffect, useRef } from "react";

export default function DraggableText({ onEnd, onSet, onCancel, initialText }) {
  const [text, setText] = useState("Tekst");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialText) {
      setText(initialText)
    } else {
      inputRef.current.focus();
      inputRef.current.select()
    }
  }, [])

  return (
    <Draggable onStop={onEnd}>
      <div className="absolute border-2 border-purple-200 z-[100000] rounded-md flex items-center">
        <input
          ref={inputRef}
          className="border-0 p-2 w-[240px] focus:outline-none cursor-pointer bg-white/50 backdrop-blur-sm shadow-md"
          value={text}
          placeholder={'Tekst'}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="absolute right-0 flex items-center flex-row">
          <div className="inline-block cursor-pointer p-1" onClick={() => onSet(text)}>
            <FaCheck color={goodColor} />
          </div>
          <div className="inline-block cursor-pointer p-1" onClick={onCancel}>
            <FaTimes color={errorColor} />
          </div>
        </div>
      </div>
    </Draggable>
  );
}
