import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
} from "react-zoom-pan-pinch";

import { Button } from "./ui/button";
import { ErrorBoundary } from "./ErrorBoundary";

interface ZoomableViewProps {
  children: React.ReactNode;
  className?: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}


function Controls() {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();

  const handleReset = () => {
    resetTransform();
    centerView(1, 0);
  };

  return (
    <div className="absolute bottom-2 right-2 flex gap-2 z-10">
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={() => zoomIn()} title="Zoom In">
          <ZoomIn />
        </Button>
        <Button variant="outline" size="icon" onClick={() => zoomOut()} title="Zoom Out">
          <ZoomOut />
        </Button>
        <Button variant="outline" size="icon" onClick={handleReset} title="Reset & Center">
          <Maximize2 />
        </Button>
      </div>
    </div>
  );
}

function ZoomableViewContent({
  children,
  className = "",
  minScale = 0.5,
  maxScale = 4,
  initialScale = 1,
}: ZoomableViewProps) {
  return (
    <div className={`relative ${className}`}>
      <TransformWrapper
        initialScale={initialScale}
        minScale={minScale}
        maxScale={maxScale}
        wheel={{ disabled: false, touchPadDisabled: false }}
        centerOnInit={true}
        limitToBounds={false}
        alignmentAnimation={{ disabled: true }}
        centerZoomedOut={false}
      >
        { }
        <Controls />
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full flex items-center justify-center p-4"
        >
          {children}
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export function ZoomableView(props: ZoomableViewProps) {
  return (
    <ErrorBoundary>
      <ZoomableViewContent {...props} />
    </ErrorBoundary>
  );
}
