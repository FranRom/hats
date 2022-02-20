import { forwardRef, useRef } from "react";
import "./index.scss";
import PasteIcon from "assets/icons/paste.icon.svg";
import CopyIcon from "assets/icons/copy.icon.svg";
import classNames from "classnames";

function EditableContent(
  {
    onChange,
    pastable,
    copyable,
    textInput,
    name,
    value,
    ...props
  }: {
    onChange?: (value: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    pastable?: boolean;
    copyable?: boolean;
    name?: string
    value?: string
    textInput?: boolean
    placeholder?: string;
  },
  ref
) {
  const localRef = useRef<HTMLTextAreaElement | HTMLInputElement>();
  const extraIcons = pastable || copyable;
  return (
    <div className="pastable-content">
      {textInput ? (<input
        type="text"
        name={name}
        value={value}
        onChange={e => {
          if (onChange) {
            onChange(e)
          }
        }} ref={ref || localRef} {...props} className="pastable-content__input" />) : (
        <textarea
          name={name}
          onChange={e => {
            if (onChange) {
              onChange(e)
            }
          }} ref={ref || localRef} {...props} className="pastable-content__textarea" />)}
      {extraIcons && (
        <div className={classNames("pastable-content__extra-icons", {
          "pastable-content__extra-icons--input": textInput
        })}>
          {pastable && (
            <img
              alt="paste"
              src={PasteIcon}
              onClick={() => {
                navigator.clipboard.readText().then((text) => {
                  if (ref)
                    ref.current!.value = text
                  else
                    localRef.current!.value = text
                });
              }}
            />
          )}
          {copyable && (
            <img
              alt="copy"
              src={CopyIcon}
              onClick={() => {
                navigator.clipboard.writeText(ref ? ref.current!.value : localRef.current!.value);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default forwardRef(EditableContent);