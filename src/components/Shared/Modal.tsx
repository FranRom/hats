import React, { useCallback } from "react";
import "../../styles/Shared/Modal.scss";

interface IProps {
  title: string,
  children: React.ReactNode,
  setShowModal: (show: boolean) => any,
  height?: string // can be any valid css height value
}

export default function Modal(props: IProps) {
  document.documentElement.style.setProperty("--height", props.height ?? "100vh");

  const escapeHandler = useCallback((event) => {
    if (event.keyCode === 27) {
      props.setShowModal(false);
    }
  }, [props]);

  React.useEffect(() => {
    window.addEventListener("keydown", escapeHandler);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "initial";
      window.removeEventListener("keydown", escapeHandler);
    }
  }, [escapeHandler]);

  const onBackdropClick = (event) => {
    if (event.target.className === "modal-wrapper") {
      props.setShowModal(false);
    }
  }

  return (
    <div className="modal-wrapper" onClick={onBackdropClick}>
      <div className="modal-content-wrapper">
        <div className="modal-top">
          <div>{props.title}</div>
          <button
            className="close"
            onClick={() => props.setShowModal(false)}>&times;</button>
        </div>
        <div className="modal-content">
          {props.children}
        </div>
      </div>
    </div>
  )
}