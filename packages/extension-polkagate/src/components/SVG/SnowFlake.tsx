// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface SnowFlakeProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  color?: string;
  size?: string;
}

const SnowFlake: React.FC<SnowFlakeProps> = ({ className,
  color = '#AA83DC',
  onClick,
  size = '18',
  style }) => (
  <svg
    className={className}
    fill='none'
    height={size}
    onClick={onClick}
    style={style}
    viewBox='0 0 18 18'
    width={size}
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M16.5695 12.661L14.7412 11.6054L16.3256 10.6712C16.6178 10.4989 16.715 10.1223 16.5427 9.83009C16.3704 9.53796 15.9939 9.44074 15.7016 9.61298L13.5191 10.8999L10.2285 8.99996L13.5185 7.10038L15.7016 8.3871C15.7995 8.44484 15.907 8.4722 16.0129 8.4722C16.2233 8.4722 16.4281 8.36409 16.5427 8.16974C16.7149 7.87752 16.6176 7.50095 16.3254 7.32863L14.7408 6.39473L16.5695 5.33896C16.8632 5.16935 16.9639 4.79367 16.7943 4.4999C16.6247 4.20604 16.249 4.10539 15.9552 4.27508L14.127 5.33069L14.1103 3.49114C14.1073 3.15191 13.829 2.87779 13.4906 2.88246C13.1514 2.88549 12.8788 3.16297 12.8819 3.5022L12.9048 6.03625L9.61429 7.93608V4.13675L11.8204 2.88991C12.1158 2.723 12.2198 2.34831 12.0529 2.0529C11.886 1.75757 11.5113 1.65339 11.2159 1.82038L9.61429 2.72562V0.614248C9.61429 0.275019 9.33927 0 9.00004 0C8.66081 0 8.38579 0.275019 8.38579 0.614248V2.72562L6.78416 1.82047C6.48867 1.65347 6.11414 1.75757 5.94715 2.05298C5.78024 2.34831 5.88433 2.72308 6.17966 2.88999L8.38571 4.13684V7.93608L5.09523 6.03625L5.11808 3.5022C5.12119 3.16297 4.84863 2.88549 4.5094 2.88246C4.50752 2.88246 4.50571 2.88246 4.50375 2.88246C4.16714 2.88246 3.89269 3.15379 3.88966 3.49122L3.87304 5.33069L2.04479 4.27508C1.75102 4.10539 1.37534 4.20612 1.20573 4.4999C1.03611 4.79367 1.13677 5.16935 1.43054 5.33896L3.25912 6.39473L1.67428 7.3288C1.38206 7.50103 1.28476 7.87761 1.457 8.16991C1.57158 8.36425 1.77641 8.47236 1.98681 8.47236C2.09278 8.47236 2.20016 8.44492 2.29811 8.38727L4.48147 7.10054L7.77163 9.00012L4.4809 10.9L2.29811 9.6129C2.00605 9.44066 1.62931 9.5378 1.457 9.83001C1.28468 10.1222 1.3819 10.4988 1.67411 10.671L3.25871 11.6054L1.43046 12.6609C1.13669 12.8305 1.03603 13.2062 1.20565 13.4999C1.31941 13.697 1.52587 13.8071 1.73816 13.8071C1.84234 13.8071 1.94799 13.7806 2.04471 13.7248L3.87296 12.6691L3.88958 14.5088C3.89261 14.8461 4.16706 15.1175 4.50367 15.1175C4.50555 15.1175 4.50743 15.1175 4.50932 15.1175C4.84855 15.1144 5.12111 14.837 5.118 14.4977L5.09515 11.9636L8.38571 10.0638V13.8632L6.17966 15.11C5.88433 15.2769 5.78024 15.6516 5.94715 15.947C6.06009 16.1469 6.2682 16.2591 6.48245 16.2591C6.58482 16.2591 6.68867 16.2335 6.78416 16.1795L8.38579 15.2744V17.3858C8.38579 17.725 8.66081 18 9.00004 18C9.33927 18 9.61429 17.725 9.61429 17.3858V15.2744L11.2159 16.1795C11.3114 16.2335 11.4152 16.2591 11.5176 16.2591C11.7319 16.2591 11.94 16.1469 12.0529 15.947C12.2198 15.6517 12.1158 15.2769 11.8204 15.11L9.61429 13.8632V10.0638L12.9048 11.9636L12.8814 14.4976C12.8782 14.8369 13.1506 15.1144 13.4899 15.1175C13.4918 15.1176 13.4937 15.1176 13.4957 15.1176C13.8322 15.1176 14.1067 14.8463 14.1098 14.509L14.1268 12.6691L15.9553 13.7248C16.052 13.7807 16.1577 13.8072 16.2618 13.8072C16.4741 13.8072 16.6806 13.697 16.7944 13.5C16.964 13.2062 16.8633 12.8306 16.5695 12.661Z'
      fill={color}
    />
  </svg>
);

export default SnowFlake;
