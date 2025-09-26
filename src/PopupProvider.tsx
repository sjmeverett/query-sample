import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import ToastContainer from "react-bootstrap/esm/ToastContainer";
import useTimeout from "./useTimeout";

/**
 * Popups have a render function to actually render them. Into it is passed
 * the functions for resolving/rejecting the promise, and whether or not the
 * popup should be visible. The visibility flag is used to allow for animations.
 */
export type PopupRenderFn<T> = (
  resolve: (value: T) => void,
  reject: (err: unknown) => void,
  visible: boolean,
) => ReactNode;

/**
 * Represents a single popup instance.
 */
export interface Popup<T> {
  id: string;
  options: PopupOptions;
  render: PopupRenderFn<T>;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
  close: () => void;
}

/**
 * Represents the context provided by PopupProvider.
 */
export interface PopupContext {
  /**
   * All the current popups.
   */
  popups: Popup<unknown>[];
  /**
   * Shows a new popup (adds it to popups).
   * @param render the function to render the popup
   * @param options options governing how the popup shows
   * @returns a promise which resolves or rejects when the popup has a result
   */
  showPopup: <T>(
    render: PopupRenderFn<T>,
    options?: PopupOptions,
  ) => Promise<T>;
}

const context = createContext<PopupContext>({
  popups: [],
  showPopup: () => Promise.reject("Not inside a PopupContext"),
});

/**
 * Gets the context from PopupProvider.
 * @returns
 */
export function usePopupContext() {
  return useContext(context);
}

/**
 * Options for showing a popup.
 */
export interface PopupOptions {
  /**
   * True if the popup is a modal; otherwise, false. Only one modal is shown at a
   * time, on top of everything except non-modal popups.
   * Non-modal popups are assumed to be toasts.
   */
  modal?: boolean;
  /**
   * Automatically hides the popup after a given number of ms.
   */
  autoHideAfterMs?: number;
  /**
   * When the popup is closed, it won't be removed until animationMs later,
   * to give the component time to animate out.
   */
  animationMs?: number;
}

/**
 * Provides context to show popups, and actually renders any popups.
 */
export default function PopupProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<Popup<any>[]>([]);

  // this gets passed down in the context to enable children to show popups
  const showPopup = useCallback(
    <T,>(render: PopupRenderFn<T>, options: PopupOptions = {}): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        // create the popup object
        const currentPopup = {
          id: crypto.randomUUID(),
          options,
          render,
          resolve,
          reject,
          close: () => {
            setPopups((popups) =>
              popups.filter((popup) => popup !== currentPopup),
            );
          },
        } satisfies Popup<T>;

        // add the popup to the array of popups
        setPopups((popups) => [...popups, currentPopup]);
      });
    },
    [],
  );

  // there can be multiple non-modal popups at a time
  const nonModals = popups.filter((popup) => !popup.options.modal);

  // only the first modal popup is shown at any given time
  const firstModal = popups.find((popup) => popup.options.modal);

  return (
    <context.Provider value={{ popups, showPopup }}>
      {children}

      {firstModal && <Wrapper popup={firstModal} />}

      <ToastContainer position="bottom-end">
        {nonModals.map((popup) => (
          <Wrapper key={popup.id} popup={popup} />
        ))}
      </ToastContainer>
    </context.Provider>
  );
}

const Wrapper = <T,>({ popup }: { popup: Popup<T> }) => {
  const [show, setShow] = useState(true);

  // automatically hide the popup after some time if set
  useTimeout(() => setShow(false), popup.options.autoHideAfterMs);

  // call the close function after a delay when the show state changes
  useTimeout(popup.close, !show ? popup.options.animationMs : undefined);

  return (
    <>
      {popup.render(
        (value) => {
          popup.resolve(value);

          if (!popup.options.animationMs) {
            popup.close();
          } else {
            setShow(false);
          }
        },
        (err) => {
          popup.reject(err);

          if (!popup.options.animationMs) {
            popup.close();
          } else {
            setShow(false);
          }
        },
        show,
      )}
    </>
  );
};
