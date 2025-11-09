import { ReactNode } from 'react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

interface EmptyEventBookingsProps {
  title: string;
  action?: ReactNode; // for your custom EmptyContent (button or anything)
}

export function EmptyEventBookings({ title, action }: EmptyEventBookingsProps) {
  return (
    <Empty className="flex flex-col items-center justify-center py-12 text-center">
      <EmptyHeader>
       <svg
          className="w-48 mx-auto"
          viewBox="0 0 238 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="61.8035"
            width="200"
            height="120"
            rx="16"
            transform="rotate(-18 0 61.8035)"
            fill="#EDEDEF"
          />
          <g filter="url(#filter0_d_10_153)">
            <rect x="34" y="62" width="200" height="120" rx="16" fill="white" />
          </g>
          <rect x="51" y="85" width="28" height="20" rx="4" fill="#D4D4D8" />
          <rect x="51" y="149" width="28" height="10" rx="4" fill="#D4D4D8" />
          <rect x="97" y="149" width="28" height="10" rx="4" fill="#D4D4D8" />
          <rect x="143" y="149" width="28" height="10" rx="4" fill="#D4D4D8" />
          <rect x="189" y="149" width="28" height="10" rx="4" fill="#D4D4D8" />
          <defs>
            <filter
              id="filter0_d_10_153"
              x="30"
              y="62"
              width="208"
              height="128"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.262745
                        0 0 0 0 0.262745
                        0 0 0 0 0.286275
                        0 0 0 0.05 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_10_153"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_10_153"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <EmptyTitle className="text-lg font-semibold">{title}</EmptyTitle>
        <EmptyDescription className="mx-auto max-w-sm text-sm text-muted-foreground">
          It looks like there’s no data in this page. You can create a new one or refresh the page.
        </EmptyDescription>
      </EmptyHeader>

      {action && <EmptyContent className="mt-6">{action}</EmptyContent>}
    </Empty>
  );
}
