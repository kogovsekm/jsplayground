import type { ReactElement } from "react";
import { Separator as PanelSeparator } from "react-resizable-panels";

interface ResizeHandleProps {
  id?: string;
}

/**
 * Renders an accessible panel separator with an orientation-aware dot grip.
 *
 * @param props - Resize handle properties.
 * @param props.id - Optional identifier forwarded to the panel separator.
 * @returns The resize handle element.
 */
function ResizeHandle({ id }: ResizeHandleProps): ReactElement {
  return (
    <PanelSeparator className="ResizeHandleOuter" id={id}>
      <span className="ResizeHandleInner">
        <span aria-hidden="true" className="ResizeHandleDots">
          <span className="ResizeHandleDot" />
          <span className="ResizeHandleDot" />
          <span className="ResizeHandleDot" />
        </span>
      </span>
    </PanelSeparator>
  );
}

export default ResizeHandle;
