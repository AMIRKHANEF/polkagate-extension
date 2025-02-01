// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { styled } from '@mui/material';
import React from 'react';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  height: '200px',
  position: 'absolute',
  right: '-10%', // positioned in the middle
  top: 0,
  width: '450px'
};

const ballStyle: React.CSSProperties = {
  borderRadius: '50%',
  filter: 'blur(80px)', // Glow effect
  height: '150px',
  opacity: 0.9,
  position: 'absolute',
  width: '150px'
};

const LeftBall = styled('div')(() => ({
  ...ballStyle,
  backgroundColor: '#5B00B6',
  left: '10%',
  top: '50%',
  transform: 'translate(-50%, -50%)'
}));

const MiddleBall = styled('div')(() => ({
  ...ballStyle,
  backgroundColor: '#FF1AB1',
  left: '50%',
  top: '35%',
  transform: 'translate(-50%, -50%)'
}));

const RightBall = styled('div')(() => ({
  ...ballStyle,
  backgroundColor: '#5B00B6',
  right: '10%',
  top: '50%',
  transform: 'translate(50%, -50%)'
}));

interface Props {
  style?: React.CSSProperties;
  id?: string;
}

const RedGradient = ({ id, style }: Props) => {
  return (
    <div id={id} style={{ ...containerStyle, ...style }}>
      <LeftBall />
      <MiddleBall />
      <RightBall />
    </div>
  );
};

export default RedGradient;
